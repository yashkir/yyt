const sqlite3 = require('sqlite3')

var db;

function init() {
  db = new sqlite3.Database('./test.db');
}

function add (text) {
  db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS tasks(id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, text TEXT)");
    db.run(`INSERT INTO tasks (text) VALUES ('${text}')`);
  });

  result = "Task added."
  return result
}

function show () {
  db.all("SELECT id, text FROM tasks", (error, rows) => {
    rows.forEach((row) => {
      console.log(`${row.id}: ${row.text}`);
    });
  });
}

function reset() {
  console.log("Resetting DB...");
  db.run("DROP TABLE IF EXISTS tasks");
}

function dump() {
    db.all("SELECT id, text FROM tasks", (error, rows) => {
      rows.forEach((row) => {
        console.log(row);
      });
    });
}

exports.init = init;
exports.add = add;
exports.show = show;
exports.reset = reset;
exports.dump = dump;
