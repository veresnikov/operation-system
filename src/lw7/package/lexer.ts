import {Token, TokenType} from "./token";
import {ReadLines} from "../../common/IO/io";
import {Parse} from "./lexemeparser";

function GetTokens(input: string): Token[] {
    const tokens: Token[] = []
    let data = ReadLines(input)
    for (let lineIndex = 0; lineIndex < data.length; lineIndex++) {
        let cursor = 0
        while (data[lineIndex].length > 0) {
            try {
                let delimiter = find(data[lineIndex], (ch) => ch === ' ')
                if (data[lineIndex][cursor] === ' ') {
                    data[lineIndex] = data[lineIndex].slice(2)
                    cursor++
                    continue
                }
                let lexeme = data[lineIndex]
                if (delimiter === -1) {
                    if (data[lineIndex][data[lineIndex].length - 1] === ';') {
                        delimiter = 1
                    } else {
                        delimiter = data[lineIndex].length
                    }
                }
                lexeme = lexeme.slice(0, delimiter)
                if (data[lineIndex].length > 2) {
                    delimiter++
                }
                tokens.push(parse(lexeme, lineIndex + 1, cursor + 1))
                data[lineIndex] = data[lineIndex].slice(delimiter)
                cursor += delimiter
            } catch (e) {
                const err = (e as Error)
                if (err.message === 'Is comment') {
                    break
                }
            }
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
        throw new Error("Is comment")
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