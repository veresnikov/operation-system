import {TokenType} from "./token";

const keywords = [
    'int', 'float', 'while', 'const', 'let', 'if', 'for', 'boolean', 'false', 'true', 'return', 'break', 'continue',
    'else', 'switch', 'case', 'default'
]

const separators = [';', ',', '(', ')', '{', '}', '[', ']']

const logical = ['>', '<', '==', '!=', '>=', '<=', '&&', '||']

type validator = (data: string) => boolean

function equalImpl(items: string[], data: string): boolean {
    for (let i = 0; i < items.length; i++) {
        let equal = false
        for (let j = 0; j < data.length; j++) {
            if (data[j] !== items[i][j]) {
                equal = false
                break
            }
            equal = true
        }
        if (equal) {
            return true
        }
    }
    return false
}

function isKeyword(data: string): boolean {
    const filtered = keywords.filter(keyword => keyword.length === data.length)
    return equalImpl(filtered, data)
}

function isSeparators(data: string): boolean {
    const filtered = separators.filter(separator => separator.length === data.length)
    return equalImpl(filtered, data)
}

function isLogical(data: string): boolean {
    const filtered = logical.filter(logic => logic.length === data.length)
    return equalImpl(filtered, data)
}

function isString(data: string): boolean {
    return data[0] === '\"' && data[data.length - 1] === '\"'
}

function isAssigment(data: string): boolean {
    return data === '='
}

function isDivision(data: string): boolean {
    return data === '/'
}

function isMultiplication(data: string): boolean {
    return data === '*'
}

function isPlus(data: string): boolean {
    return data === '+'
}

function isMinus(data: string): boolean {
    return data === '-'
}

function isAlphaCode(data: number): boolean {
    return ('a'.charCodeAt(0) <= data && 'z'.charCodeAt(0) >= data) ||
        ('A'.charCodeAt(0) <= data && 'Z'.charCodeAt(0) >= data)
}

function isNumberCode(data: number): boolean {
    return '0'.charCodeAt(0) <= data && '9'.charCodeAt(0) >= data
}

function isIdentifier(data: string): boolean {
    for (let code of data) {
        if (!(isAlphaCode(code.charCodeAt(0)) || isNumberCode(code.charCodeAt(0)))) {
            return false
        }
    }
    return !(isNumberCode(data.charCodeAt(0)) || !isAlphaCode(data.charCodeAt(0)))
}

function isComment(data: string): boolean {
    return data === '//'
}

function isNumber(data: string): boolean {
    let [isFloat, isHex, isOct, isBin] = [false, false, false, false]
    if (data === '') {
        return false
    }
    for (let i = 0; i < data.length; i++) {
        if (
            (isBin && isNumberCode(data[i].codePointAt(0) ?? 0) && data[i] <= '1') ||
            (isOct && isNumberCode(data[i].codePointAt(0) ?? 0) && data[i] <= '7') ||
            (!isBin && !isOct && isNumberCode(data[i].codePointAt(0) ?? 0))
        ) {
            continue
        }
        if (
            (isHex && isAlphaCode(data[i].codePointAt(0) ?? 0)) &&
            (data[i] <= 'f' && data[i] >= 'a' || data[i] <= 'F' && data[i] >= 'A')
        ) {
            continue
        }
        if (data[i] === '.' && isFloat) {
            return false
        }
        if (data[i] === '.' && !isFloat) {
            isFloat = true
            continue
        }
        if (
            (data.length > 2 && i === 1 && data[0] === '0') &&
            (data[1] === 'x' || data[1] === 'b' || data[1] === 'e')
        ) {
            isHex = data[1] === 'x'
            isOct = data[1] === 'b'
            isBin = data[1] === 'e'
            continue
        }
        return false
    }
    return true
}

const validators: Map<TokenType, validator> = new Map<TokenType, validator>([
    [TokenType.KEYWORD, isKeyword],
    [TokenType.IDENTIFIER, isIdentifier],
    [TokenType.ASSIGMENT, isAssigment],
    [TokenType.NUMBER, isNumber],
    [TokenType.SEPARATOR, isSeparators],
    [TokenType.PLUS, isPlus],
    [TokenType.MINUS, isMinus],
    [TokenType.MULTIPLICATION, isMultiplication],
    [TokenType.DIVISION, isDivision],
    [TokenType.STRING, isString],
    [TokenType.COMMENT, isComment],
    [TokenType.LOGICAL, isLogical],

])

function Parse(data: string): TokenType {
    for (let validator of validators) {
        if (validator[1](data)) {
            return validator[0]
        }
    }
    return TokenType.ERROR
}

export {Parse}