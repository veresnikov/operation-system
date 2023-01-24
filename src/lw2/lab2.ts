import {Command} from '@commander-js/extra-typings';
import {MinimizeMealy, MinimizeMoore} from "./package/minimizer";

const program = new Command()
program
    .version('1.0.0')
    .description('automata minimizer')
    .action((str, options) => {
        try {
            if (options.args.length !== 3) {
                throw new Error('usage: bin/labs-runner lab2 [mealy|moore] [input csv filename] [output csv filename]')
            }
            switch (options.args[0]) {
                case 'mealy':
                    MinimizeMealy(options.args[1], options.args[2])
                    return
                case 'moore':
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