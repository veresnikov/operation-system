import {Command} from '@commander-js/extra-typings';
import {GetTokens} from "./package/lexer";

const program = new Command()
program
    .version('1.0.0')
    .description('lexer')
    .action((str, options) => {
        try {
            if (options.args.length !== 1) {
                throw new Error('usage: bin/labs-runner lab7 [input csv filename]')
            }
            console.log(GetTokens(options.args[0]))

        } catch (e) {
            const err = e as Error
            console.log(err)
        }
    })
    .parse(process.argv)