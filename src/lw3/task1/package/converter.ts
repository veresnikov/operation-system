import {ReadGrammar, WriteDeterministicAutomaton} from "../../../common/IO/io";
import {Grammar, GrammarSide, NonDeterministicAutomaton, NonDeterministicMoves} from "../../../common/model/models";
import {Get, Set as set} from "../../../common/utils/maps";
import {Determinate} from "./determinator";

function Convert(grammarSide: string, input: string, output: string): void {
    const grammar = ReadGrammar(input, toGrammarSide(grammarSide))
    const automaton = grammarToAutomaton(grammar)
    const result = Determinate(automaton)
    WriteDeterministicAutomaton(output, result)
}

function grammarToAutomaton(grammar: Grammar): NonDeterministicAutomaton {
    switch (grammar.side) {
        case "left":
            return leftImpl(grammar)
        case "right":
            return rightImpl(grammar)
    }
}

function leftImpl(grammar: Grammar): NonDeterministicAutomaton {
    const states: string[] = ['H']
    grammar.nonTerminalSymbols.map(symbol => states.push(symbol))
    const finalStates = new Set<string>([states[1]])
    const moves: NonDeterministicMoves = new Map()
    grammar.rules.forEach((dstNonTerminals, nonTerminalWithTerminal) => dstNonTerminals.map(dstNonTerminal => {
        const initState = dstNonTerminal !== '' ? dstNonTerminal : 'H'
        const k = {state: initState, symbol: nonTerminalWithTerminal.Terminal}
        set(moves,k, [...(Get(moves, k) ?? []), nonTerminalWithTerminal.NonTerminal])
    }))
    return {finalStates: finalStates, inputSymbols: grammar.terminalSymbols, moves: moves, states: states}
}

function rightImpl(grammar: Grammar): NonDeterministicAutomaton {
    const states: string[] = []
    grammar.nonTerminalSymbols.map(symbol => states.push(symbol))
    states.push('F')
    const finalStates = new Set<string>(['F'])
    const moves: NonDeterministicMoves = new Map()
    grammar.rules.forEach((dstNonTerminals, nonTerminalWithTerminal) => {
        const k = {state: nonTerminalWithTerminal.NonTerminal, symbol: nonTerminalWithTerminal.Terminal}
        dstNonTerminals.map(dstNonTerminal => {
            const dst = dstNonTerminal !== '' ? dstNonTerminal : 'F'
            set(moves, k, [...(Get(moves, k) ?? []), dst])
        })
    })
    return {finalStates: finalStates, inputSymbols: grammar.terminalSymbols, moves: moves, states: states}
}

function toGrammarSide(grammarSide: string): GrammarSide {
    switch (grammarSide) {
        case 'left':
            return 'left'
        case 'right':
            return 'right'
        default:
            throw new Error('unexpected grammar side')
    }
}

export {Convert}