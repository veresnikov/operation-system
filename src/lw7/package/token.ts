enum TokenType {
    IDENTIFIER = 'IDENTIFIER',

    KEYWORD = 'KEYWORD',
    NUMBER = 'NUMBER',
    SEPARATOR = 'SEPARATOR',
    PLUS = 'PLUS',
    MINUS = 'MINUS',
    MULTIPLICATION = 'MULTIPLICATION',
    DIVISION = 'DIVISION',
    ASSIGMENT = 'ASSIGMENT',
    STRING = 'STRING',
    COMMENT = 'COMMENT',
    LOGICAL = 'LOGICAL',
    ERROR = 'ERROR',
}

type Token = {
    type: TokenType
    lexeme: string
    line: number
    column: number
}

function TokenToString(token: Token): string {
    return token.type.toString() + ' ' + '"' + token.lexeme + '"' + ' ' + '[' + token.line + ',' + token.column + ']'
}

export {TokenType, TokenToString}
export type {Token}