import sqlite3 = require('sqlite3')

var db: sqlite3.Database;

//nothing
export interface ITask {
    id: number,
    text: string,
    isDone: boolean
}

export interface IListCallback {
    (tasks: ITask[]): void;
}

export function init(path: string, verbose?: boolean): boolean {
    db = new sqlite3.Database(path);
    if (verbose) {
        sqlite3.verbose();
    }

    create_table();

    return true;
}

export function add(text: string): void {
    db.run("INSERT INTO tasks (text, done) VALUES (?, 0)", text);
}

export function done(id: number): void {
    db.run("UPDATE tasks SET done=1 WHERE id IS ?", id);
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
