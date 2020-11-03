/* --------------------------------------------------------------------------
 * users
 *
 * Provide functions for accessing the 'users' table of our database.
 * ----------------------------------------------------------------------- */
import sqlite3 = require('sqlite3')

/* --------------------------------------------------------------------------
 * Exports
 * ----------------------------------------------------------------------- */
export interface IUserRecord {
    id:       number,
    username: string,
    email:    string,
    password: string,
}

var db: sqlite3.Database;

export function connectDb(path: string, callback?: (err: Error) => void) {
    db = new sqlite3.Database(path, callback);
    console.log("connected to db");
}


export function getUserById(id: string,
                            callback?: (err: Error, user: IUserRecord | null) => void) {
    db.get("SELECT id, username, email, password FROM users WHERE id=?", [id], (err, row) => {
        callback(err, parseRowToUserRecord(row));
    });
}

export function getUserByUsername(username: string,
                                  callback?: (err: Error, user: IUserRecord | null) => void) {
    db.get("SELECT id, username, email, password FROM users WHERE username=?", [username], (err, row) => {
        callback(err, parseRowToUserRecord(row));
    });
}

export function addUser(user: IUserRecord, callback?: (err: Error) => void) {
    db.get("SELECT username FROM users WHERE username=?", [user.username], (err, row) => {
        if (!row) {
            db.run("INSERT INTO users (username, email, password) VALUES(?,?,?)",
                    [user.username, user.email, user.password],
                    (err) => { callback(err); }
            );
        } else {
            callback(new Error("Duplicate username."));
        }
    });
}

export function createUserTable(callback?: (err: Error) => void) {
    db.run(`CREATE TABLE IF NOT EXISTS
            users (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                   username TEXT, email TEXT, password TEXT) `,
            err => callback(err));
}

export function dropUserTable(callback?: (err: Error) => void) {
    db.run("DROP TABLE IF EXISTS users", err => callback(err));
}

/* --------------------------------------------------------------------------
 * Local functions
 * ----------------------------------------------------------------------- */
function parseRowToUserRecord(row: any): IUserRecord | null {
    try {
        const user: IUserRecord = {
            id: row.id,
            username: row.username,
            email: row.email,
            password: row.password,
        };
        return user;
    } catch (error) {
        if (error instanceof TypeError) {
            return null;
        } else {
            throw error;
        }
    }
};
