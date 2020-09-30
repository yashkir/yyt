const sqlite3 = require('sqlite3')

var db;

function init() {
    db = new sqlite3.Database('/home/yashkir/tmp/test.db');
    sqlite3.verbose();
}

function add(text) {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS 
                tasks(id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                      text TEXT,
                      done BOOLEAN)`);
        db.run(`INSERT INTO tasks (text, done) VALUES ('${text}', 0)`);
    });

    result = "Task added."
    return result
}

function done(id) {
    db.serialize(() => {
        //db.get(`SELECT text FROM tasks WHERE id=${id}`, (error, row) => {
            //new_text = `DONE -- ${row.text}`;
            //db.run(`UPDATE tasks SET text='${new_text}' WHERE id IS ${id}`);
        //});
        db.run(`UPDATE tasks SET done=1 WHERE id IS ${id}`);
    });
    return;
}

function show (callback) {
    db.all("SELECT id, text, done FROM tasks", (error, rows) => {
        console.log(rows);
        callback(rows);
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
exports.done = done;
