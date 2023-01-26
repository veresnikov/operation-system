import {parse} from 'csv-parse/sync'
import {stringify} from 'csv-stringify/sync'
import * as fs from "fs";
import * as path from "path";
import {
    DeterministicAutomaton,
    DeterministicMoves,
    FromStateAndInputSymbol,
    Grammar,
    GrammarSide,
    Mealy,
    Moore,
    MoveWithSignals, NonDeterministicAutomaton, NonDeterministicMoves,
    Rules
} from "../model/models";
import {Get, Set as set} from "../utils/maps";
import {Add} from "../utils/sets";

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

function ReadGrammar(filename: string, grammarSide: GrammarSide): Grammar {
    const filePath = path.resolve(filename)
    const data = fs.readFileSync(filePath, 'utf-8').split(/\r?\n/)

    const nonTerminals: string[] = []
    const uniqueTerminals = new Set<string>();
    const rules: Rules = new Map();
    data.map(line => {
        const rule = line.split(' -> ')
        const sourceNonTerminal = rule[0]
        nonTerminals.push(sourceNonTerminal)

        rule[1].split(' | ').map(symbol => {
            let [dstNonTerminal, terminal] = ["", ""]
            if (symbol.length === 1) {
                terminal = symbol
            } else if (grammarSide === 'left') {
                dstNonTerminal = symbol[0]
                terminal = symbol[1]
            } else if (grammarSide === 'right') {
                dstNonTerminal = symbol[1]
                terminal = symbol[0]
            }
            Add(uniqueTerminals, terminal)
            const k = {NonTerminal: sourceNonTerminal, Terminal: terminal}
            set(rules, k, [...(Get(rules, k) ?? []), dstNonTerminal])
        })
    })

    const terminalSymbols: string[] = []
    uniqueTerminals.forEach(s => terminalSymbols.push(s))
    return {nonTerminalSymbols: nonTerminals, rules: rules, side: grammarSide, terminalSymbols: terminalSymbols.sort()}
}

function ReadLines(filename: string): string[] {
    const filePath = path.resolve(filename)
    return  fs.readFileSync(filePath, 'utf-8').split(/\r?\n/)
}

function WriteDeterministicAutomaton(filename: string, automaton: DeterministicAutomaton): void {
    writeCSV(filename, prepareDeterministicAutomaton(automaton))
}

function ReadNonDeterministicAutomaton(filename: string): NonDeterministicAutomaton {
    const data = readCSV(filename)
    const {states, signals} = getMooreStates(data)
    const inputSymbols = getMooreInputSymbols(data)
    return {
        finalStates: getFinalStates(signals),
        inputSymbols: inputSymbols,
        moves: getNonDeterministicMoves(data, states, inputSymbols),
        states: states
    }
}

function getFinalStates(signals: Map<string, string>): Set<string> {
    const result = new Set<string>();
    signals.forEach((signal, state) => {
        if (signal === 'F') {
            Add(result, state)
        }
    })
    return result
}

function getNonDeterministicMoves(data: string[][], states: string[], inputSymbols: string[]): NonDeterministicMoves {
    const transposedData = transpose(data.slice(2))
    const result: NonDeterministicMoves = new Map();
    transposedData.slice(1).map((stateWithMoves, i) => stateWithMoves.map((moves, j) => {
        if (moves === '-') {
            return
        }
        const k = {state: states[i], symbol: inputSymbols[j]}
        moves.split(',').map(move => set(result, k, [...(Get(result, k) ?? []), move]))
    }))
    return result
}

function prepareDeterministicAutomaton(automaton: DeterministicAutomaton): string[][] {
    const result: string[][] = []
    for (let i = 0; i < automaton.inputSymbols.length + 2; i++) {
        result.push([])
    }
    result[0].push("")
    result[1].push("")
    automaton.states.map(state => {
        if (Get(automaton.finalStates, state)) {
            result[0].push('F')
        } else {
            result[0].push('')
        }
        result[1].push(state)
    })
    automaton.inputSymbols.map((symbol, i) => {
        result[i + 2].push(symbol)
        automaton.states.map(state => {
            let dst = Get(automaton.moves, {state: state, symbol: symbol}) ?? ''
            if (dst === '') {
                dst = '-'
            }
            result[i + 2].push(dst)
        })
    })
    return result
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
        set(result, stateAndInput, move)
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
        set(signals, state, s[i])
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
        set(result, stateAndInput, {signal: signal, state: state})
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

export {
    ReadMealy,
    ReadMoore,
    WriteMoore,
    WriteMealy,
    ReadGrammar,
    WriteDeterministicAutomaton,
    ReadNonDeterministicAutomaton,
    ReadLines
}