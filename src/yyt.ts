import readline = require('readline');
import yargs = require("yargs");
import backend = require('./backend')
import fs = require('fs')
import chalk = require('chalk');

const VALID_COMMANDS = ['ls', 'add', 'do', 'del', 'resetdb', 'dumpdb', 'export', 'import'];
const DBPATH = '/home/yashkir/tmp/test.db'

const CHALK_DONE = chalk.grey


/* Open the DB */

backend.init(DBPATH);


/* Parse  Arguments */

yargs
    .usage("Usage: $0 <command> <id/text>")
    .option('all', {
        alias: 'a',
        describe: 'target all tasks',
        boolean: true,
    })
    .command('ls', 'list all tasks', {}, (argv) => {
        if (argv.a) {
            list(true);
        } else {
            list()
        }
    })
    .command('add <task>', "Add a task to the task list.", {}, (argv) => {
        argv._.splice(0, 1, argv.task as string);
        add(argv._.join(' '));
    })
    .command('do <task_id>', "mark a task as done", {}, (argv) => {
        done(argv.task_id as number);
    })
    .command('del <task_id>', "delete a task", {}, (argv) => {
        del(argv.task_id as number);
    })
    .command('resetdb', "reset the database yay", {}, () => {
        resetdb();
    })
    .command('dumpdb', "Output the whole database", {}, () => {
        dumpdb();
    })
    .command('export <filename>', "export to a todo.txt formatted file", {}, (argv) => {
        export_todotxt(argv.filename as string);
    })
    .command('import <filename>', "import a todo.txt formatted file, erases the DB", {}, (argv) => {
        import_todotxt(argv.filename as string);
    })
    .demandCommand(1)
    .check((argv) => {
        if (VALID_COMMANDS.indexOf(argv._[0]) < 0) {
            throw new Error(`Invalid command: "${argv._[0]}"`);
        } else {
            return true;
        }
    })
    .argv;


/* These commands are run by yargs */

function list(showAll?: boolean) {
    backend.list((tasks) => {
        tasks.forEach((task) => {
            let line: string;

            if (task.isDone) {
                if (showAll) {
                    console.log(CHALK_DONE( `${task.id} : DONE : ${task.text}` ))
                }
            } else {
                console.log(`${task.id} : ${task.text}`);
            }
        });
    });
}

function add(task_text: string) {
    console.log(`adding task: ${task_text}`);
    backend.add(task_text);
}

function del(task_id: number) {
    const rl = readline.createInterface(process.stdin, process.stdout);

    console.log(`deleting task: ${task_id}`);
    // TODO factor confirmation out
    rl.question("Are you sure? (yes/NO):", (answer) => {
        if(answer.toLowerCase() == 'yes') {
            backend.del(task_id);
        }
        rl.close();
    });
}

function done(task_id: number) {
    console.log(`Doing task: ${task_id}`);
    backend.done(task_id);
}

function resetdb() {
    const rl = readline.createInterface(process.stdin, process.stdout);

    rl.write("RESETTING THE DATABASE\n");
    rl.question("Are you sure? (yes/NO):", (answer) => {
        if(answer == 'yes') {
            backend.reset();
        }
        rl.close();
    });
}

function dumpdb() {
    backend.dump( (rows: any[]) => {
        console.table(rows);
    });
}

function export_todotxt(filename: string) {
    backend.export_todotxt((blob) => {
        fs.writeFile(filename, blob, (err) => {
            if (err) {
                console.log(err);
            }
        });
    });
}

function import_todotxt(filename: string) {
    fs.readFile(filename, {'encoding': 'utf-8'}, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            backend.import_todotxt(data);
        }
    });
}
