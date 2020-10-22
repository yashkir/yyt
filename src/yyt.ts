/* -------------------------------------------------------------------------- 
 * yyt
 *
 * CLI interface to manage tasks stored in an SQLite database.
 * ----------------------------------------------------------------------- */
import readline = require('readline');
import yargs = require("yargs");
import backend = require('./db/backend')
import fs = require('fs')
import chalk = require('chalk');

const VALID_COMMANDS = ['ls', 'add', 'do', 'del', 'resetdb', 'dumpdb', 'export', 'import', 'create'];
const DBPATH = '/home/yashkir/tmp/test.db'
const USER_ID = 'yashkir55'
const CHALK_DONE = chalk.grey

backend.init(DBPATH);

/* -------------------------------------------------------------------------- 
 * Set up yargs, it manages the whole front-end.
 * ----------------------------------------------------------------------- */
yargs
    .usage("Usage: $0 <command> <id/text>")
    .option('all', {
        alias: 'a',
        describe: 'target all tasks',
        boolean: true,
    })
    // TODO username option
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
    .command('create <user_id>', "Create a table for a user", {}, (argv) => {
        backend.create_table_for_user(argv.user_id as string, (err: Error) => {
            if (err) {
                console.log(err);
            }
        });
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

/* -------------------------------------------------------------------------- 
 * Commands to be run by yargs
 * ----------------------------------------------------------------------- */

function list(showAll?: boolean) {
    backend.list(USER_ID, (tasks) => {
        tasks.forEach((task) => {
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
    backend.add(USER_ID, task_text);
}

function del(task_id: number) {
    const rl = readline.createInterface(process.stdin, process.stdout);

    console.log(`deleting task: ${task_id}`);
    // TODO factor confirmation out
    rl.question("Are you sure? (yes/NO):", (answer) => {
        if(answer.toLowerCase() == 'yes') {
            backend.del(USER_ID, task_id);
        }
        rl.close();
    });
}

function done(task_id: number) {
    console.log(`Doing task: ${task_id}`);
    backend.done(USER_ID, task_id);
}

function resetdb() {
    const rl = readline.createInterface(process.stdin, process.stdout);

    rl.write("RESETTING THE DATABASE\n");
    rl.question("Are you sure? (yes/NO):", (answer) => {
        if(answer == 'yes') {
            backend.reset(USER_ID);
        }
        rl.close();
    });
}

function dumpdb() {
    backend.dump(USER_ID, (rows: any[]) => {
        console.table(rows);
    });
}

function export_todotxt(filename: string) {
    backend.export_todotxt(USER_ID, (blob) => {
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
            backend.import_todotxt(USER_ID, data);
        }
    });
}
