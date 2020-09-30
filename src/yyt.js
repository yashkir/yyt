#!/usr/bin/env node

const readline = require('readline');
const yargs = require("yargs");
const backend = require('./backend')

backend.init();

yargs
.usage("Usage: <command> <id/text>")

.command('ls', 'list all tasks', { }, () => {
    backend.show()
})
.command('add <task>', "Add a task to the task list.", {}, (argv) => {
    console.log(`adding task: ${argv.task}`);
    backend.add(argv.task);
})
.command('do <task_id>', "mark a task as done", {}, (argv) => {
    console.log(`Doing task: ${argv.task_id}`);
    backend.done(argv.task_id);
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
.argv;
