/* --------------------------------------------------------------------------
 * backend
 *
 * Provides functions for accessing and manipulating the 'tasks_${username}'
 * tables. Must be initialized to connect to the DB before use.
 * ----------------------------------------------------------------------- */
import * as sqlite3 from 'sqlite3';
import { createUsersTable } from './users';

export var db: sqlite3.Database;

/* --------------------------------------------------------------------------
 * Interface Exports
 * ----------------------------------------------------------------------- */
export interface ITask {
    id: number,
    text: string,
    isDone: boolean
}

/* --------------------------------------------------------------------------
 * Function Exports
 * ----------------------------------------------------------------------- */
export function set_serialize(yes: boolean) {
    if (yes) {
        db.serialize();
    } else {
        db.parallelize();
    }
}

export function init(path: string, verbose: boolean, callback: (err: Error | null) => void): void {
    db = new sqlite3.Database(path, (err) => {
        if (err) {
            return callback(err);
        } else {
            if (verbose) {
                sqlite3.verbose();
            }
            createUsersTable( (err) => {
                callback(err);
            });
        }
    });
}

export function close(): void {
    db.close();
}

export function add(user_id: string, text: string, done: boolean = false,
                    callback?: (err: Error | null) => void): void {
    db.run(`INSERT INTO tasks_${user_id} (text, done) VALUES (?, ?)`, [text, done], (err) => {
        if (callback) {
            callback(err);
        }
    });
}

export function del(user_id: string, id: number, callback?: (err: Error | null) => void): void {
    db.run(`DELETE FROM tasks_${user_id} WHERE id=?`, [id], (err) => {
        if (callback) {
            callback(err);
        }
    });
}

export function done(user_id: string, id: number, toggle?: boolean, callback?: (err: Error | null) => void): void {
    if (toggle) {
        db.get(`SELECT done FROM tasks_${user_id} WHERE id IS ?`, [id], (err, row) => {
            if (err) {
                if (callback) { callback(err); }
            } else if (row.done == 0) {
                db.run(`UPDATE tasks_${user_id} SET done=1 WHERE id IS ?`, [id], (err) => {
                    if (callback) { callback(err); }
                });
            } else {
                db.run(`UPDATE tasks_${user_id} SET done=0 WHERE id IS ?`, [id], (err) => {
                    if (callback) { callback(err); }
                });
            }
        });
    } else {
        db.run(`UPDATE tasks_${user_id} SET done=1 WHERE id IS ?`, [id], (err) => {
            if (callback) {
              callback(err);
            }
        });
    }
}

export function list(user_id: string, callback: (err: Error, tasks: ITask[] | null) => void,
                     filter?: string): void {
    let tasks: ITask[] = [];
    db.all(`SELECT id, text, done FROM tasks_${user_id}`, (error, rows) => {
        if (error) {
            return callback(error, null);
        }
        rows.forEach((row) => {
            if (filter && row.text.indexOf(filter) == -1) {
                return;
            }
            tasks.push({
                id: row.id,
                text: row.text,
                isDone: row.done
            });
        });
        callback(error, tasks);
    });
}

export function reset(user_id: string): void {
    db.run(`DROP TABLE IF EXISTS tasks_${user_id}`);

    create_table_for_user(user_id, () => {});
}

export function dump(user_id: string, callback: { (arg0: any[]): void }) {
    db.all(`SELECT * FROM tasks_${user_id}`, (error, rows) => {
        if (error) {
            throw error;
        }
        callback(rows);
    });
}

export function export_todotxt(user_id: string, callback: { (arg0: string): void }): void {
    let lines: string[] = [];

    list(user_id, (err, tasks) => {
        if (!tasks) {
            return callback('');
        }

        tasks.forEach((task) => {
            let line: string;
            if (task.isDone) {
                line = `x ${task.text}`;
            } else {
                line = `${task.text}`;
            }
            lines.push(line);
        });

        let blob = lines.join('\n')
        return callback(blob);
    });
}

/* Load a 'todo.txt' formatted string into the database.
 * WARNING: resets the database.  */
export function import_todotxt(user_id: string, blob: string, callback?: (err: Error | null) => void): void {
    let lines = blob.split('\n');

    db.serialize(() => {
        reset(user_id);
        lines.forEach((line) => {
            if (/^x /.test(line)) {
                add(user_id, line.replace(/^x /, ''), true);
            } else if (line.length > 0) {
                add(user_id, line);
            }
        });
        if (callback) { callback(null); }
    });
}


export function create_table_for_user(user_id: string, callback?: (err: Error | null) => void) {
    // Make sure there is no funny business in the name
    if (user_id.match(/[^A-Za-z0-9_]/)) {
        return callback(new Error("Invalid username, must contain only letters, numbers, or the underscore"));
    }

    db.run(`CREATE TABLE IF NOT EXISTS
            tasks_${user_id} (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                  text TEXT,
                  done BOOLEAN)`, [], callback);
}
