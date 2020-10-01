import sqlite3 = require('sqlite3')

var db: sqlite3.Database;

export interface ITask {
    id: number,
    text: string,
    isDone: boolean
}

export interface IListCallback {
    (tasks: ITask[]): void;
}

export function init(verbose?: boolean): void {
    db = new sqlite3.Database('/home/yashkir/tmp/test.db');
    if (verbose) {
        sqlite3.verbose();
    }

    create_table();
}

export function add(text: string): string {
    db.serialize(() => {
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

export function list(callback: IListCallback): void {
    let tasks: ITask[] = [];
    db.all("SELECT id, text, done FROM tasks", (error, rows) => {
        if (error) {
            throw error;
        }
        rows.forEach((row) => {
            tasks.push({
                id: row.id,
                text: row.text,
                isDone: row.done
            });
        });
        callback(tasks);
    });
}

export function reset(): void {
    console.log("Resetting DB...");
    db.run("DROP TABLE IF EXISTS tasks");
    create_table();
}

export function dump(): void {
    db.all("SELECT * FROM tasks", (error, rows) => {
        if (error) {
            throw error;
        }
        console.log(rows)
    });
}

function create_table(): void {
    db.run(`CREATE TABLE IF NOT EXISTS
            tasks(id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                  text TEXT,
                  done BOOLEAN)`);
}
