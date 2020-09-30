#!/usr/bin/env node


//const db = new sqlite3.Database('./test.db');

let command = process.argv[2];

if (!command) {
  console.log(
    "Welcome to YYT.\n" +
    "Commands: resetdb, dumpdb, add, show"
  );
  return;
}

const sqlite3 = require('sqlite3')
const tasks = require('./backend')

tasks.init();

switch(command) {

  case 'resetdb':
    tasks.reset()
    break;

  case 'add':
    let task_text = process.argv[3];
    console.log(`Adding task: ${task_text}`);
    tasks.add(task_text)
    break;

  case 'done':
    let id = process.argv[3];
    tasks.done(id);
    break;
  
  case 'show':
    tasks.show();
    break;

  case 'dumpdb':
    tasks.dump()
    break;

  default:
    console.log(`Command "${command}" not recognized.`);
}
