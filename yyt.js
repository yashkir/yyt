const sqlite3 = require('sqlite3')
const tasks = require('./backend')

//const db = new sqlite3.Database('./test.db');

let command = process.argv[2];

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
  
  case 'show':
    tasks.show();
    break;

  case 'dumpdb':
    tasks.dump()
    break;

  default:
    console.log(`Command "${command}" not recognized.`);
}
