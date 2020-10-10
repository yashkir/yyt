import readline = require('readline');
import yargs = require("yargs");
import backend = require('./backend')
import fs = require('fs')

const VALID_COMMANDS = ['ls', 'add', 'do', 'resetdb', 'dumpdb', 'export', 'import'];
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
