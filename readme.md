# Operation system course

1) install node modules
```bash
./bin/build
```
2) run labs
```bash
./bin/labs-runner lab1 mealy-to-moore example/lw1/input-mealy.csv lab1-mealy-to-moore-output.csv
```
```bash
./bin/labs-runner lab1 moore-to-mealy example/lw1/input-moore.csv lab1-moore-to-mealy-output.csv
```
```bash
./bin/labs-runner lab2 mealy example/lw2/input-mealy.csv lab2-mealy-output.csv
```
```bash
./bin/labs-runner lab2 moore example/lw2/input-moore.csv lab2-moore-output.csv
```
```bash
./bin/labs-runner lab3-task1 left example/lw3/task1/left-side-grammar.txt lab3-left-side-grammar-output.txt
```
```bash
./bin/labs-runner lab3-task1 left example/lw3/task1/right-side-grammar.txt lab3-right-side-grammar-output.txt
```
```bash
./bin/labs-runner lab3-task2 example/lw3/task2/input.csv lab3-task2-output.csv
```
```bash
./bin/labs-runner lab7 example/lw7/big-input.txt lab7-output.txt
```
```bash
./bin/run-lexer-tests
```