import {Command} from '@commander-js/extra-typings';
import {MealyToMoore, MooreToMealy} from "./package/converter";

const program = new Command()
program
    .version('1.0.0')
    .description('automata converter')
    .action((str, options) => {
        try {
            if (options.args.length !== 3) {
                throw new Error('usage: bin/labs-runner lab1 [mealy-to-moore|moore-to-mealy] [input csv filename] [output csv filename]')
            }
            switch (options.args[0]) {
                case 'mealy-to-moore':
                    MealyToMoore(options.args[1], options.args[2])
                    return
                case 'moore-to-mealy':
                    MooreToMealy(options.args[1], options.args[2])
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