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

export function init(path: string, verbose?: boolean): boolean {
    db = new sqlite3.Database(path);
    if (verbose) {
        sqlite3.verbose();
    }

    create_table();

    return true;
}

export function add(text: string, done: boolean = false): void {
    db.run("INSERT INTO tasks (text, done) VALUES (?, ?)", text, done);
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
    db.run("DROP TABLE IF EXISTS tasks");

    create_table();
}

export function dump(callback: { (arg0: any[]): void }) {
    db.all("SELECT * FROM tasks", (error, rows) => {
        if (error) {
            throw error;
        }
        callback(rows);
    });
}

export function export_todotxt(callback: { (arg0: string): void }): void {
    let lines: string[] = [];

    list((tasks: ITask[]) => {
        tasks.forEach((task) => {
            let line: string;
            if (task.isDone) {
                line = `x ${task.text}`;
            } else {
                line = `${task.text}`;
            }
            lines.push(line);
            console.log(lines);
        });

        let blob = lines.join('\n')
        callback(blob);
    });
}

/**
 * Load a 'todo.txt' formatted string into the database.
 * WARNING: resets the database.
 */
export function import_todotxt(blob: string): void {
    let lines = blob.split('\n');

    db.serialize(() => {
        reset();
        lines.forEach((line) => {
            if (/^x /.test(line)) {
                add(line.replace(/^x /, ''), true);
            } else if (line.length > 0) {
                add(line);
            }
        });
    });
}

function create_table(): void {
    db.run(`CREATE TABLE IF NOT EXISTS
            tasks(id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                  text TEXT,
                  done BOOLEAN)`);
}
