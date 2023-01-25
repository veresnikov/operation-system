import {DeterministicAutomaton, DeterministicMoves, NonDeterministicAutomaton} from "../../common/model/models";
import {Get, Set as set} from "../../common/utils/maps";

function Determinate(automaton: NonDeterministicAutomaton): DeterministicAutomaton {
    const closures = getClosures(automaton)
    const stateHashMap = new Map<string, state>();
    const newStates: string[] = []
    const newFinalStates = new Map<string, boolean>();
    const newMoves: DeterministicMoves = new Map();

    let stateQueue: string[][] = [[automaton.states[0]]]
    while (stateQueue.length > 0) {
        const states = stateQueue[0]
        stateQueue = stateQueue.slice(1)
        const currState = getFullState(states, closures, automaton.finalStates)
        const stateHash = states.join()
        if (Get(stateHashMap, stateHash)) {
            continue
        }
        set(stateHashMap, stateHash, currState)
        newStates.push(stateHash)
        set(newFinalStates, stateHash, currState.final)
        automaton.inputSymbols.map(symbol => {
            if (symbol === 'e') {
                return
            }
            const newKey = {state: stateHash, symbol: symbol}
            const dstStates: string[] = []
            currState.states.map(state => (Get(automaton.moves, {
                state: state,
                symbol: symbol
            }) ?? []).map(initDstState => {
                dstStates.push(initDstState)
            }))
            if (dstStates.length !== 0) {
                stateQueue.push(dstStates)
                const dstState = getFullState(dstStates, closures, automaton.finalStates)
                set(newMoves, newKey, dstState.states.join())
            }
        })
    }
    const [resultStates, resultFinalStates, resultMoves] = getStatesNames(newStates, newFinalStates, newMoves)
    return {
        finalStates: resultFinalStates,
        inputSymbols: removeEmptyInputSymbol(automaton.inputSymbols),
        moves: resultMoves,
        states: resultStates
    }
}

function removeEmptyInputSymbol(symbols: string[]): string[] {
    const result: string[] = []
    symbols.map(symbol => {
        if (symbol !== 'e') {
            result.push(symbol)
        }
    })
    return result
}

function getStatesNames(states: string[], finalStates: Map<string, boolean>, moves: DeterministicMoves): [string[], Map<string, boolean>, DeterministicMoves] {
    const newStateNamesMap = new Map<string, string>();
    let num = 0
    const newStates: string[] = []
    states.map(state => {
        const newStateName = 'S' + num
        num++
        set(newStateNamesMap, state, newStateName)
        newStates.push(newStateName)
    })
    const newFinalStates = new Map<string, boolean>();
    finalStates.forEach((final, state) => set(newFinalStates, Get(newStateNamesMap, state) ?? '', final))
    const newMoves: DeterministicMoves = new Map();
    moves.forEach((dstState, key) => {
        const newKey = {
            state: Get(newStateNamesMap, key.state) ?? '', symbol: key.symbol
        }
        set(newMoves, newKey, Get(newStateNamesMap, dstState) ?? '')
    })
    return [newStates, newFinalStates, newMoves]
}

function getFullState(states: string[], closures: Map<string, state>, finalStates: Set<string>): state {
    const stateSet = new Set<string>();
    states.map(state => {
        stateSet.add(state)
        const closure = Get(closures, state)
        if (closure) {
            closure.states.map(closureState => stateSet.add(closureState))
        }
    })
    const resultStates: string[] = []
    let final = false
    stateSet.forEach(state => {
        resultStates.push(state)
        if (finalStates.has(state)) {
            final = true
        }
    })
    resultStates.sort()
    return {final: final, states: resultStates}
}

function getClosures(automaton: NonDeterministicAutomaton): Map<string, state> {
    const flatClosures = new Map<string, string[]>();
    automaton.states.map(state => (Get(automaton.moves, {state: state, symbol: 'e'}) ?? [])
        .map(dstState => set(flatClosures, state, [...Get(flatClosures, state) ?? [], dstState])))
    if (flatClosures.size === 0) {
        return new Map<string, state>();
    }
    while (recurse(flatClosures)) {
    }
    const result = new Map<string, state>();
    flatClosures.forEach((closures, state) => {
        let final = false
        closures.map(closure => {
            if (final) {
                return
            }
            if (automaton.finalStates.has(closure)) {
                final = true
            }
        })
        set(result, state, {final: final, states: closures})
    })
    return result
}

function recurse(result: Map<string, string[]>): boolean {
    let found = false
    result.forEach((closures, state) => closures.map(closure => (Get(result, closure) ?? []).map(transitiveState => {
        if (existInArray(Get(result, closure) ?? [], transitiveState)) {
            return
        }
        set(result, state, [...(Get(result, state) ?? []), transitiveState])
        found = true
    })))
    return found
}

function existInArray(arr: string[], find: string): boolean {
    let result = false
    arr.map(v => {
        if (v === find) {
            result = true
        }
    })
    return result
}

type state = {
    final: boolean
    states: string[]
}

export {Determinate}