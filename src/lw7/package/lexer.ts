import {Token, TokenType} from "./token";
import {ReadLines} from "../../common/IO/io";
import {Parse} from "./lexemeparser";

function GetTokens(input: string): Token[] {
    const tokens: Token[] = []

    let data = ReadLines(input)
    for (let linePos = 0; linePos < data.length; linePos++) {
        let cursor = 0
        while (data[linePos].length > 0) {
            let delimiter = find(data[linePos], (ch) => ch === ' ')
            let lexeme = data[linePos]
            if (delimiter === -1) {
                delimiter = 1
            }
            lexeme = lexeme.slice(0, delimiter)
            if (data[linePos].length > 2) {
                delimiter++
            }
            tokens.push(parse(lexeme, linePos, cursor))
            data[linePos] = data[linePos].slice(delimiter)
            cursor += delimiter
        }
    }
    return tokens
}

function parse(data: string, line: number, column: number): Token {
    const type = Parse(data)
    if (type === TokenType.ERROR) {
        throw new Error("Wrong lexeme at position. On line: " + line + " On position: " + column + " Lexeme: " + '"' + data + '"')
    }
    if (type === TokenType.COMMENT) {
        throw new Error("Comment is not required")
    }
    return {column: column, lexeme: data, line: line, type: type}
}

function find(input: string, predicate: (ch: string) => boolean): number {
    for (let i = 0; i < input.length; i++) {
        if (predicate(input[i])) {
            return i
        }
    }
    return -1
}

export {GetTokens}