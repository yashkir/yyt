import sqlite3 = require('sqlite3')

export interface IUserRecord {
    id:       string,
    username: string,
    email:    string,
    password: string,
}

export function getUserById(path: string, id: string,
                            callback?: (err: Error, user: IUserRecord | null) => void) {
    let db = new sqlite3.Database(path);
    db.get("SELECT id, username, email, password FROM users WHERE id=?", [id], (err, row) => {
        callback(err, parseRowToUserRecord(row));
    });
}

export function getUserByUsername(path: string, username: string,
                                  callback?: (err: Error, user: IUserRecord | null) => void) {
    let db = new sqlite3.Database(path);
    db.get("SELECT id, username, email, password FROM users WHERE username=?", [username], (err, row) => {
        callback(err, parseRowToUserRecord(row));
    });
}

export function addUser(path: string, user: IUserRecord, callback?: (err: Error) => void) {
    let db = new sqlite3.Database(path);
    db.run("INSERT INTO users (id, username, email, password) VALUES(?,?,?,?)",
            [user.id, user.username, user.email, user.password],
            (err) => { callback(err); }
    );
}

export function createUserTable(path: string, callback?: (err: Error) => void) {
    let db = new sqlite3.Database(path);
    db.run(`CREATE TABLE IF NOT EXISTS
            users (id TEXT, username TEXT, email TEXT, password TEXT) `,
            err => callback(err));
}

export function dropUserTable(path: string, callback?: (err: Error) => void) {
    let db = new sqlite3.Database(path);
    db.run("DROP TABLE IF EXISTS users", err => callback(err));
}

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
            console.log(error);
            return null;
        } else {
            throw error;
        }
    }
};
