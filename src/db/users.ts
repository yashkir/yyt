import sqlite3 = require('sqlite3')

type userRecord = {
    id:       string,
    username: string,
    email:    string,
    password: string,
}

export function getUserById(path: string, id: string, callback?: (user: userRecord) => void) {
    let db = new sqlite3.Database(path);
    db.get("SELECT id, username, email, password FROM users", (err, row) => {
        const user: userRecord = {
            id: row.id,
            username: row.username, 
            email: row.email,
            password: row.password,
        };
        callback(user);
    });
}

export function addUser(path: string, user: userRecord, callback?: (err: Error) => void) {
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
