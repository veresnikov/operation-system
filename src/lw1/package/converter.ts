import {ReadMealy, ReadMoore, WriteMealy, WriteMoore} from "../../common/IO/io";
import {DestStateAndSignal, FromStateAndInputSymbol, Mealy, Moore, MoveWithSignals} from "../../common/model/models";
import {Get} from "../../common/utils/maps";

function MealyToMoore(input: string, output: string): void {
    let mealy = ReadMealy(input)
    const newMooreStates = createNewMooreStates(mealy)
    const states = getMooreStateIDs(newMooreStates)
    const stateToSignal = getMooreStateSignals(newMooreStates)
    const moves = getMooreMoves(mealy, states, newMooreStates)
    const moore: Moore = {
        inputSymbols: mealy.inputSymbols, moves: moves, stateSignals: stateToSignal, states: states
    }
    WriteMoore(output, moore)
}

function MooreToMealy(input: string, output: string): void {
    let moore = ReadMoore(input)
    const mealy: Mealy = {inputSymbols: moore.inputSymbols, moves: getMealyMoves(moore), states: moore.states}
    WriteMealy(output, mealy)
}

function getMealyMoves(automation: Moore): MoveWithSignals {
    const result: MoveWithSignals = new Map()
    automation.moves.forEach((value, key) => {
        result.set(key, {
            signal: Get(automation.stateSignals, value) as string, state: value
        })
    })
    return result
}

function createNewMooreStates(automation: Mealy): Map<string, DestStateAndSignal> {
    const processed = new Map<DestStateAndSignal, boolean>();
    const result = new Map<string, DestStateAndSignal>();
    let c = 0
    automation.inputSymbols.map(symbol => automation.states.map(state => {
        const destStateAndSignal = Get(automation.moves, {state: state, symbol: symbol}) as DestStateAndSignal
        if (Get(processed, destStateAndSignal) ?? false) {
            return
        }
        result.set('S' + c, destStateAndSignal)
        ++c
        processed.set(destStateAndSignal, true)
    }))
    return result
}

function getMooreStateIDs(states: Map<string, DestStateAndSignal>): string[] {
    const result: string[] = []
    states.forEach((v, k) => {
        result.push(k)
    })
    return result.sort()
}

function getMooreStateSignals(states: Map<string, DestStateAndSignal>): Map<string, string> {
    const result = new Map<string, string>();
    states.forEach((v, k) => {
        result.set(k, v.signal)
    })
    return result
}

function getMooreMoves(automation: Mealy, statesIDs: string[], states: Map<string, DestStateAndSignal>): Map<FromStateAndInputSymbol, string> {
    const stateToSignal = new Map<DestStateAndSignal, string>()
    states.forEach((v, k) => stateToSignal.set(v, k))
    const result = new Map<FromStateAndInputSymbol, string>();
    statesIDs.map(id => {
        const oldState = (Get(states, id) as DestStateAndSignal).state
        automation.inputSymbols.map(symbol => {
            const dst = Get(automation.moves, {state: oldState, symbol: symbol}) as DestStateAndSignal
            result.set({state: id, symbol: symbol}, Get(stateToSignal, dst) as string)
        })
    })
    return result
}

export {MealyToMoore, MooreToMealy}