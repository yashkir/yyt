import readline = require('readline');
import yargs = require("yargs");
import backend = require('./backend')

const VALID_COMMANDS = ['ls', 'add', 'do', 'resetdb', 'dumpdb'];
const DBPATH = '/home/yashkir/tmp/test.db'

backend.init(DBPATH);

yargs
    .usage("Usage: $0 <command> <id/text>")
    .command('ls', 'list all tasks', {}, () => {
        backend.list((tasks) => {
            tasks.forEach((task) => {
                console.log(`${task.isDone} ${task.id}: ${task.text}`);
            });
        });
    })
    .command('add <task>', "Add a task to the task list.", {}, (argv) => {
        console.log(`adding task: ${argv.task}`);
        backend.add(argv.task as string);
    })
    .command('do <task_id>', "mark a task as done", {}, (argv) => {
        console.log(`Doing task: ${argv.task_id}`);
        backend.done(argv.task_id as number);
    })
    .command('resetdb', "reset the database", {}, () => {
        const rl = readline.createInterface(process.stdin, process.stdout);

        rl.write("RESETTING THE DATABASE\n");
        rl.question("Are you sure? (yes/NO):", (answer) => {
            if(answer == 'yes') {
                backend.reset();
            }
            rl.close();
        });
    })
    .command('dumpdb', "Output the whole database", {},
        () => {
            backend.dump();
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
