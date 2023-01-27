import {Command} from '@commander-js/extra-typings';
import {GetTokens} from "./package/lexer";
import {TokenToString} from "./package/token";
import {WriteToFile} from "../common/IO/io";

const program = new Command()
program
    .version('1.0.0')
    .description('lexer')
    .action((str, options) => {
        try {
            if (options.args.length !== 2) {
                throw new Error('usage: bin/labs-runner lab7 [input filename] [output filename]')
            }
            const tokens = GetTokens(options.args[0])
            tokens.map(token => {
                const str = TokenToString(token)
                console.log(str)
                WriteToFile(options.args[1], str)
            })

        } catch (e) {
            const err = e as Error
            console.log(err)
        }
    })
    .parse(process.argv)