import readline = require('readline');
import yargs = require("yargs");
import backend = require('./db/backend')
import fs = require('fs')
import chalk = require('chalk');
import { DBPATH } from './config';

const VALID_COMMANDS = ['ls', 'lsf', 'add', 'do', 'del', 'reset', 'dump', 'export', 'import', 'create'];
const CHALK_DONE = chalk.grey

backend.init(DBPATH, true, err => { if (err) { console.log(err) } });

var argv = yargs
    .usage("Usage: $0 <command> <id/text>")
    .option('all', {
        alias: 'a',
        describe: 'target all tasks',
        boolean: true,
    })
    .option('user', {
        alias: 'u',
        default: 'local',
        describe: 'select user to use',
        type: 'string',
    })
    .command('ls', 'list all tasks', {}, (argv) => {
        if (argv.a) {
            list(argv.user as string, true);
        } else {
            list(argv.user as string)
        }
    })
    .command('lsf <filter>', 'list all tasks that match filter', {}, (argv) => {
        const showAll: boolean = argv.a ? true : false;
        list(argv.user as string, showAll, argv.filter as string);
    })
    .command('add <task>', "Add a task to the task list.", {}, (argv) => {
        argv._.splice(0, 1, argv.task as string);
        add(argv.user as string, argv._.join(' '));
    })
    .command('do <task_id>', "mark a task as done", {}, (argv) => {
        done(argv.user as string, argv.task_id as number);
    })
    .command('del <task_id>', "delete a task", {}, (argv) => {
        del(argv.user as string, argv.task_id as number);
    })
    .command('reset', "reset the tasks", {}, (argv) => {
        resetTasks(argv.user as string);
    })
    .command('dump', "output the raw tasks", {}, (argv) => {
        dumpTasks(argv.user as string);
    })
    .command('export <filename>', "export to a todo.txt formatted file", {}, (argv) => {
        export_todotxt(argv.user as string, argv.filename as string);
    })
    .command('import <filename>', "import a todo.txt formatted file, erases the DB", {}, (argv) => {
        import_todotxt(argv.user as string, argv.filename as string);
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

function list(user: string, showAll?: boolean, filter?: string) {
    if (filter) {
        console.log(`Tasks matching: '${filter}'`);
    } else {
        console.log(`Tasks for (${user}):`);
    }
    if (showAll) {
        console.log(`(including done tasks)`)
    }
    console.log(`----------------------------------------`);

    backend.list(user, (err, tasks) => {
        if (err) return console.log(err);
        tasks.forEach((task) => {
            if (task.isDone) {
                if (showAll) {
                    console.log(CHALK_DONE( `${task.id} : DONE : ${task.text}` ))
                }
            } else {
                console.log(`${task.id} : ${task.text}`);
            }
        });
    }, filter);
}

function add(user: string, task_text: string) {
    console.log(`adding task: ${task_text}`);
    backend.add(user, task_text);
}

function del(user: string, task_id: number) {
    const rl = readline.createInterface(process.stdin, process.stdout);

    console.log(`deleting task: ${task_id}`);
    // TODO factor confirmation out
    rl.question("Are you sure? (yes/NO):", (answer) => {
        if(answer.toLowerCase() == 'yes') {
            backend.del(user, task_id);
        }
        rl.close();
    });
}

function done(user: string, task_id: number) {
    console.log(`Doing task: ${task_id}`);
    backend.done(user, task_id);
}

function resetTasks(user: string) {
    const rl = readline.createInterface(process.stdin, process.stdout);

    rl.write("RESETTING THE DATABASE\n");
    rl.question("Are you sure? (yes/NO):", (answer) => {
        if(answer == 'yes') {
            backend.reset(user);
        }
        rl.close();
    });
}

function dumpTasks(user: string) {
    backend.dump(user, (rows: any[]) => {
        console.log(rows);
    });
}

function export_todotxt(user: string, filename: string) {
    backend.export_todotxt(user, (blob) => {
        fs.writeFile(filename, blob, (err) => {
            if (err) {
                console.log(err);
            }
        });
    });
}

function import_todotxt(user: string, filename: string) {
    fs.readFile(filename, {'encoding': 'utf-8'}, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            backend.import_todotxt(user, data);
        }
    });
}
