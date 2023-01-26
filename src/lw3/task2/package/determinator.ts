import {ReadNonDeterministicAutomaton, WriteDeterministicAutomaton} from "../../../common/IO/io";
import {Determinate as DeterminateImpl} from "../../task1/package/determinator";
function Determinate(input: string, output: string): void {
    const automation = ReadNonDeterministicAutomaton(input)
    const result = DeterminateImpl(automation)
    WriteDeterministicAutomaton(output, result)
}

export {Determinate}