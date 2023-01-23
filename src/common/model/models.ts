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

interface Mealy {
    states: string[]
    inputSymbols: string[]
    moves: MoveWithSignals
}

interface Moore {
    states: string[]
    inputSymbols: string[]
    stateSignals: Map<string, string>
    moves: DeterministicMoves
}

export type {
    FromStateAndInputSymbol,
    DestStateAndSignal,
    MoveWithSignals,
    DeterministicMoves,
    NonDeterministicMoves,
    Moore,
    Mealy
}