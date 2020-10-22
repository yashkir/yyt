import sqlite3 = require('sqlite3')

export interface IUserRecord {
    id:       string,
    username: string,
    email:    string,
    password: string,
}

function parseRowToUserRecord(row: any): IUserRecord {
    const user: IUserRecord = {
        id: row.id,
        username: row.username, 
        email: row.email,
        password: row.password,
    };
    return user;
};

export function getUserById(path: string, id: string, callback?: (user: IUserRecord) => void) {
    let db = new sqlite3.Database(path);
    db.get("SELECT id, username, email, password FROM users WHERE id=?", [id], (err, row) => {
        callback( parseRowToUserRecord(row) );
    });
}

export function getUserByUsername(path: string, username: string, callback?: (user: IUserRecord) => void) {
    let db = new sqlite3.Database(path);
    db.get("SELECT id, username, email, password FROM users WHERE username=?", [username], (err, row) => {
        callback( parseRowToUserRecord(row) );
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

const path = '/home/yashkir/tmp/test.db';

//createUserTable(path, (err) => {
    //if (err) console.log(err);
    //addUser(path, 
            //{id: 'smg56633', username: 'test', email: 'test@test.com', password: 'password'},
            //(err) => { if (err) console.log(err) });
//});
