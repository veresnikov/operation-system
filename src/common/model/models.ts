type FromStateAndInputSymbol = {
    state: string
    symbol: string
}

type DestStateAndSignal = {
    state: string
    signal: string
}

// @ts-ignore
type MoveWithSignals = Map<FromStateAndInputSymbol, DestStateAndSignal>
// @ts-ignore
type DeterministicMoves = Map<FromStateAndInputSymbol, string>
// @ts-ignore
type NonDeterministicMoves = Map<FromStateAndInputSymbol, string[]>

type Mealy = {
    states: string[]
    inputSymbols: string[]
    moves: MoveWithSignals
}

type Moore = {
    states: string[]
    inputSymbols: string[]
    stateSignals: Map<string, string>
    moves: DeterministicMoves
}

type NonTerminalWithTerminal = {
    NonTerminal: string
    Terminal: string
}

type Rules = Map<NonTerminalWithTerminal, string[]>

type GrammarSide = 'left' | 'right'

type Grammar = {
    nonTerminalSymbols: string[]
    terminalSymbols: string[]
    rules: Rules
    side: GrammarSide
}

type NonDeterministicAutomaton = {
    states: string[]
    inputSymbols: string[]
    finalStates: Map<string, boolean>
    moves: NonDeterministicMoves
}

type DeterministicAutomaton = {
    states: string[]
    inputSymbols: string[]
    finalStates: Map<string, boolean>
    moves: DeterministicMoves
}

export type {
    FromStateAndInputSymbol,
    DestStateAndSignal,
    MoveWithSignals,
    DeterministicMoves,
    NonDeterministicMoves,
    Moore,
    Mealy,
    NonTerminalWithTerminal,
    Rules,
    GrammarSide,
    Grammar,
    NonDeterministicAutomaton,
    DeterministicAutomaton
}