import {Command} from '@commander-js/extra-typings';
import {MinimizeMealy, MinimizeMoore} from "./package/minimizer";

const program = new Command()
program
    .version('1.0.0')
    .description('grammar converter')
    .action((str, options) => {
        try {
            if (options.args.length !== 3) {
                throw new Error('usage: bin/labs-runner lab3-task1 [left|right] [input csv filename] [output csv filename]')
            }
            switch (options.args[0]) {
                case 'left':
                    MinimizeMealy(options.args[1], options.args[2])
                    return
                case 'right':
                    MinimizeMoore(options.args[1], options.args[2])
                    return
                default:
                    throw new Error('unknown run type')
            }
        } catch (e) {
            const err = e as Error
            console.log(err)
        }
    })
    .parse(process.argv)