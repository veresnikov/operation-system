import {Command} from '@commander-js/extra-typings';
import {Convert} from "./package/converter";

const program = new Command()
program
    .version('1.0.0')
    .description('grammar converter')
    .action((str, options) => {
        try {
            if (options.args.length !== 3) {
                throw new Error('usage: bin/labs-runner lab3-task1 [left|right] [input csv filename] [output csv filename]')
            }
            Convert(options.args[0], options.args[1], options.args[2])
        } catch (e) {
            const err = e as Error
            console.log(err)
        }
    })
    .parse(process.argv)