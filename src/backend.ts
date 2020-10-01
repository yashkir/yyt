import sqlite3 = require('sqlite3')

var db: sqlite3.Database;

interface IShowCallback {
    (rows: any[]): void;
}

export function init(): void {
    db = new sqlite3.Database('/home/yashkir/tmp/test.db');
    sqlite3.verbose();
}

export function add(text: string): string {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS 
                tasks(id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                      text TEXT,
                      done BOOLEAN)`);
        db.run(`INSERT INTO tasks (text, done) VALUES ('${text}', 0)`);
    });

    let result = "Task added."
    return result
}

export function done(id: number): void {
    db.serialize(() => {
        //db.get(`SELECT text FROM tasks WHERE id=${id}`, (error, row) => {
            //new_text = `DONE -- ${row.text}`;
            //db.run(`UPDATE tasks SET text='${new_text}' WHERE id IS ${id}`);
        //});
        db.run(`UPDATE tasks SET done=1 WHERE id IS ${id}`);
    });
    return;
}

export function show (callback: IShowCallback): void {
    db.all("SELECT id, text, done FROM tasks", (error, rows) => {
        console.log(rows);
        callback(rows);
    });
}

export function reset(): void {
    console.log("Resetting DB...");
    db.run("DROP TABLE IF EXISTS tasks");
}

export function dump(): void {
    db.all("SELECT id, text FROM tasks", (error, rows) => {
        rows.forEach((row) => {
            console.log(row);
        });
    });
}
