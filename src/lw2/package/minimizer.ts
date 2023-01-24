import {ReadMealy, ReadMoore, WriteMealy, WriteMoore} from "../../common/IO/io";
import {
    DestStateAndSignal,
    DeterministicMoves,
    FromStateAndInputSymbol,
    Mealy, Moore,
    MoveWithSignals
} from "../../common/model/models";
import {Delete, Get} from "../../common/utils/maps";

function MinimizeMealy(input: string, output: string): void {
    let mealy = ReadMealy(input)
    mealy = removeUnavailableMealyStates(mealy)
    let {groupToState, amount} = getOneEqualGroups(mealy)
    while (true) {
        const prevGroupAmount = amount
        const m = optimizeMealyMoves(mealy.moves)
        let next = getNextEqualGroups(groupToState, mealy.inputSymbols, m)
        groupToState = next.stateToNewGroupMap
        amount = next.amount
        if (prevGroupAmount === amount) {
            break
        }
    }
    mealy = getMinimizedMealy(mealy, groupToState)
    WriteMealy(output, mealy)
}

function MinimizeMoore(input: string, output: string): void {
    let moore = ReadMoore(input)
    moore = removeUnavailableMooreStates(moore)
    let {groupToState, amount} = getZeroEqualGroups(moore.stateSignals)
    while (true) {
        const prevGroupAmount = amount
        const next = getNextEqualGroups(groupToState, moore.inputSymbols, moore.moves)
        groupToState = next.stateToNewGroupMap
        amount = next.amount
        if (prevGroupAmount === amount) {
            break
        }
    }
    moore = getMinimizedMoore(moore, groupToState)
    WriteMoore(output, moore)
}

function getMinimizedMoore(moore: Moore, groupToState: Map<number, string[]>): Moore {
    const oldStateToNewState = new Map<string, string>();
    const newStates: string[] = []
    const newStateSignals = new Map<string, string>();
    groupToState.forEach((states, group) => {
        const state = states[0]
        const newState = 'S' + group
        states.map(oldState => {
            oldStateToNewState.set(oldState, newState)
        })
        newStates.push(newState)
        newStateSignals.set(newState, Get(moore.stateSignals, state) ?? '')
    })
    const newMoves: DeterministicMoves = new Map();
    groupToState.forEach(states => {
        const state = states[0]
        moore.inputSymbols.map(symbol => {
            const oldDstState = Get(moore.moves, {state: state, symbol: symbol}) ?? ''
            const k: FromStateAndInputSymbol = {state: Get(oldStateToNewState, state) ?? '', symbol: symbol}
            newMoves.set(k, Get(oldStateToNewState, oldDstState) ?? '')
        })
    })
    newStates.sort()
    return {inputSymbols: moore.inputSymbols, moves: newMoves, stateSignals: newStateSignals, states: newStates}
}

function removeUnavailableMooreStates(moore: Moore): Moore {
    const availableStates = new Map<string, boolean>;
    moore.moves.forEach((dest, from) => {
        if (from.state !== dest) {
            availableStates.set(dest, true)
        }
    })
    const newStates: string[] = []
    moore.states.slice(1).map(state => {
        if (Get(availableStates, state)) {
            newStates.push(state)
            return
        }
        moore.inputSymbols.map(symbol => {
            Delete(moore.moves, {state: state, symbol: symbol})
        })
        Delete(moore.stateSignals, state)
    })
    return {inputSymbols: moore.inputSymbols, moves: moore.moves, stateSignals: moore.stateSignals, states: newStates}
}

function getZeroEqualGroups(stateSignals: Map<string, string>): { groupToState: Map<number, string[]>, amount: number } {
    const signalToStatesMap = new Map<string, string[]>();
    stateSignals.forEach((signal, state) => {
        const prev = Get(signalToStatesMap, signal) ?? []
        signalToStatesMap.set(signal, [...prev, state])
    })
    const groupToState = new Map<number, string[]>();
    let amount = 0
    signalToStatesMap.forEach(states => {
        states.map(state => {
            const prev = Get(groupToState, amount) ?? []
            groupToState.set(amount, [...prev, state])
        })
        amount++
    })
    return {groupToState: groupToState, amount: amount}
}

function removeUnavailableMealyStates(mealy: Mealy): Mealy {
    const availableStates = new Map<string, boolean>;
    mealy.moves.forEach((dest, from) => {
        if (from.state != dest.state) {
            availableStates.set(dest.state, true)
        }
    })

    const newStates: string[] = []
    mealy.states.slice(1).map(state => {
        if (Get(availableStates, state)) {
            newStates.push(state)
            return
        }
        mealy.inputSymbols.map(symbol => {
            Delete(mealy.moves, {state: state, symbol: symbol})
        })
    })
    return {inputSymbols: mealy.inputSymbols, moves: mealy.moves, states: newStates}
}

function getOneEqualGroups(mealy: Mealy): { groupToState: Map<number, string[]>, amount: number } {
    const stateToGroupHashMap = new Map<string, string>();
    mealy.states.map(source => mealy.inputSymbols.map(input => {
        const dstSignal = (Get(mealy.moves, {state: source, symbol: input}) as DestStateAndSignal).signal
        let prev = Get(stateToGroupHashMap, source) ?? ""
        stateToGroupHashMap.set(source, prev + dstSignal)
    }))
    const groupHashToStatesMap = getGroupHashToStatesMap(stateToGroupHashMap)
    const groupToStatesMap = new Map<number, string[]>();
    let amount = 0
    groupHashToStatesMap.forEach(states => {
            states.map(state => {
                let prev = Get(groupToStatesMap, amount) ?? []
                groupToStatesMap.set(amount, [...prev, state])
            })
            amount++
        }
    )
    return {groupToState: groupToStatesMap, amount: amount}
}

function getNextEqualGroups(
    groupsToStatesMap: Map<number, string[]>,
    inputSymbols: string[],
    moves: DeterministicMoves
): { stateToNewGroupMap: Map<number, string[]>, amount: number } {
    const stateToNewGroupMap = new Map<number, string[]>();
    const stateToNewGroup = getStateToGroupMap(groupsToStatesMap)
    let amount = 0

    groupsToStatesMap.forEach(groupStates => {
        const stateToGroupHashMap = new Map<string, string>();
        groupStates.map(source => inputSymbols.map(input => {
            const dst = Get(moves, {state: source, symbol: input}) as string
            const dstGroup = Get(stateToNewGroup, dst) ?? 0
            const prev = Get(stateToGroupHashMap, source) ?? ''
            stateToGroupHashMap.set(source, prev + String(dstGroup))
        }))
        const groupHashToStatesMap = getGroupHashToStatesMap(stateToGroupHashMap)
        groupHashToStatesMap.forEach(newStates => {
                newStates.map(state => {
                    const prev = Get(stateToNewGroupMap, amount) ?? []
                    stateToNewGroupMap.set(amount, [...prev, state])
                })
                amount++
            }
        )
    })
    return {amount: amount, stateToNewGroupMap: stateToNewGroupMap}
}

function optimizeMealyMoves(moves: MoveWithSignals): DeterministicMoves {
    const result: DeterministicMoves = new Map();
    moves.forEach((dst, from) => result.set(from, dst.state))
    return result
}

function getMinimizedMealy(mealy: Mealy, groupToStatesMap: Map<number, string[]>): Mealy {
    const oldToNewStateMap = new Map<string, string>();
    const newStates: string[] = []
    groupToStatesMap.forEach((oldStates, group) => {
        const newState = 'S' + group
        oldStates.map(oldState => oldToNewStateMap.set(oldState, newState))
        newStates.push(newState)
    })
    const newMoves: MoveWithSignals = new Map()
    groupToStatesMap.forEach(states => {
        const state = states[0]
        mealy.inputSymbols.map(symbol => {
            const oldDstStateAndSignal = Get(mealy.moves, {state: state, symbol: symbol}) as DestStateAndSignal
            const newKey: FromStateAndInputSymbol = {state: Get(oldToNewStateMap, state) as string, symbol: symbol}
            newMoves.set(newKey, {
                signal: oldDstStateAndSignal.signal,
                state: Get(oldToNewStateMap, oldDstStateAndSignal.state) as string ?? ''
            })
        })
    })
    newStates.sort()
    return {inputSymbols: mealy.inputSymbols, moves: newMoves, states: newStates}
}

function getStateToGroupMap(groupToStatesMap: Map<number, string[]>): Map<string, number> {
    const result = new Map<string, number>();
    groupToStatesMap.forEach((states, group) => states.map(state => result.set(state, group)))
    return result
}

function getGroupHashToStatesMap(stateToGroup: Map<string, string>): Map<string, string[]> {
    let result = new Map<string, string[]>();
    stateToGroup.forEach((groupHash, state) => {
        let prev = Get(result, groupHash) ?? []
        result.set(groupHash, [...prev, state])
    })
    return result
}

export {MinimizeMealy, MinimizeMoore}