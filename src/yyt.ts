import readline = require('readline');
import yargs = require("yargs");
import backend = require('./backend')

const VALID_COMMANDS = ['ls', 'add', 'do', 'resetdb', 'dumpdb'];
const DBPATH = '/home/yashkir/tmp/test.db'


/* Open the DB */

backend.init(DBPATH);


/* Parse  Arguments */

yargs
    .usage("Usage: $0 <command> <id/text>")
    .command('ls', 'list all tasks', {}, () => {
        list();
    })
    .command('add <task>', "Add a task to the task list.", {}, (argv) => {
        add(argv.task as string);
    })
    .command('do <task_id>', "mark a task as done", {}, (argv) => {
        done(argv.task_id as number);
    })
    .command('resetdb', "reset the database yay", {}, () => {
        resetdb();
    })
    .command('dumpdb', "Output the whole database", {}, () => {
        dumpdb();
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

function list() {
    backend.list((tasks) => {
        tasks.forEach((task) => {
            console.log(`${task.isDone} ${task.id}: ${task.text}`);
        });
    });
}

function add(task_text: string) {
    console.log(`adding task: ${task_text}`);
    backend.add(task_text);
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
    backend.dump();
}
