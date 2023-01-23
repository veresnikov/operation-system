import {parse} from 'csv-parse/sync'
import {stringify} from 'csv-stringify/sync'
import * as fs from "fs";
import * as path from "path";
import {DeterministicMoves, FromStateAndInputSymbol, Mealy, Moore, MoveWithSignals} from "../model/models";
import {Get} from "../utils/maps";


function ReadMealy(filename: string): Mealy {
    const data = readCSV(filename)
    const states = getMealyStates(data)
    const symbols = getMealyInputSymbols(data)
    const movesWithSignals = getMovesWithSignals(data, states, symbols)
    return {
        inputSymbols: symbols, moves: movesWithSignals, states: states
    }
}

function ReadMoore(filename: string): Moore {
    const data = readCSV(filename)
    const mooreStates = getMooreStates(data)
    const symbols = getMooreInputSymbols(data)
    const moves = getDeterministicMoves(data, mooreStates.states, symbols)
    return {
        inputSymbols: symbols, moves: moves, stateSignals: mooreStates.signals, states: mooreStates.states
    }
}

function WriteMoore(filename: string, moore: Moore): void {
    writeCSV(filename, prepareMoore(moore))
}

function WriteMealy(filename: string, mealy: Mealy): void {
    writeCSV(filename, prepareMealy(mealy))
}

function getDeterministicMoves(data: string[][], states: string[], symbols: string[]): DeterministicMoves {
    const transposedData = transpose(data.slice(2))
    let result: DeterministicMoves = new Map()
    transposedData.slice(1).map((stateAndMoves, i) => stateAndMoves.map((move, j) => {
        if (move === '-') {
            return
        }
        const stateAndInput: FromStateAndInputSymbol = {
            state: states[i], symbol: symbols[j]
        }
        result.set(stateAndInput, move)
    }))
    return result
}

function getMooreInputSymbols(data: string[][]): string[] {
    const symbols: string[] = []
    data.slice(2).map(value => {
        symbols.push(value[0])
    })
    return symbols
}

function getMooreStates(data: string[][]): { states: string[], signals: Map<string, string> } {
    const states = data[1].slice(1)
    const s = data[0].slice(1)

    const signals = new Map<string, string>;
    states.map((state, i) => {
        // @ts-ignore
        signals.set(state, s[i])
    })
    return {signals: signals, states: states}
}

function getMealyStates(data: string[][]): string[] {
    return data[0].slice(1)
}

function getMealyInputSymbols(data: string[][]): string[] {
    const symbols: string[] = []
    data.slice(1).map((value) => {
        symbols.push(value[0])
    })
    return symbols
}

function getMovesWithSignals(data: string[][], states: string[], symbols: string[]): MoveWithSignals {
    const transposedData = transpose(data.slice(1))
    let result: MoveWithSignals = new Map()
    transposedData.slice(1).map((stateWithMoves, i) => stateWithMoves.map((move, j) => {
        if (move === '-') {
            return
        }
        const stateAndInput: FromStateAndInputSymbol = {
            state: states[i], symbol: symbols[j]
        }
        const [state, signal] = move.split('/')
        result.set(stateAndInput, {signal: signal, state: state})
    }))
    return result
}

function prepareMealy(mealy: Mealy): string[][] {
    const result: string[][] = []
    for (let i = 0; i < mealy.inputSymbols.length + 1; i++) {
        result.push([])
    }
    result[0].push('')
    mealy.states.map(state => result[0].push(state))
    mealy.inputSymbols.map((symbol, i) => {
        result[i + 1].push(symbol)
        mealy.states.map(state => {
            const move = Get(mealy.moves, {state: state, symbol: symbol})
            result[i + 1].push(move ? move.state + '/' + move.signal : '-')
        })
    })
    return result
}

function prepareMoore(moore: Moore): string[][] {
    const result: string[][] = []
    moore.inputSymbols.map(() => {
        result.push([])
    })
    result[0].push('')
    result[1].push('')
    moore.states.map(state => {
        result[0].push(Get(moore.stateSignals, state as string) as string)
        result[1].push(state)
    })
    moore.inputSymbols.map((symbol, i) => {
        result.push([symbol])
        moore.states.map(state => {
            const k: FromStateAndInputSymbol = {state: state, symbol: symbol}
            let dst = Get(moore.moves, k) ?? '-'
            result[i + 2].push(dst)
        })
    })
    return result
}

function transpose(data: string[][]): string[][] {
    const impl = (matrix: string[][]) => matrix[0].map((col, i) => matrix.map(row => row[i]))
    return impl(data)
}

function readCSV(filename: string): string[][] {
    const filePath = path.resolve(filename)
    const data = fs.readFileSync(filePath)
    return parse(data, {
        delimiter: ';'
    })
}

function writeCSV(filename: string, data: string[][]): void {
    const csv = stringify(data, {
        delimiter: ';'
    })
    const filePath = path.resolve(filename)
    fs.writeFileSync(filePath, csv, {flag: 'w'})
}

export {ReadMealy, ReadMoore, WriteMoore, WriteMealy}