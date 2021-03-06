/* --------------------------------------------------------------------------
 * users
 *
 * Provide functions for accessing the 'users' table of our database.
 * ----------------------------------------------------------------------- */
import { db } from './backend';

/* --------------------------------------------------------------------------
 * Exports
 * ----------------------------------------------------------------------- */
export interface IUserRecord {
    id:       number,
    username: string,
    email:    string,
    password: string,
    isGuest?: boolean,
}

export function getUserById(id: string,
                            callback: (err: Error, user: IUserRecord | null) => void) {
    db.get("SELECT id, username, email, password FROM users WHERE id=?", [id], (err, row) => {
        callback(err, parseRowToUserRecord(row));
    });
}

export function getUserByUsername(username: string,
                                  callback: (err: Error, user: IUserRecord | null) => void) {
    db.get("SELECT id, username, email, password FROM users WHERE username=?", [username], (err, row) => {
        callback(err, parseRowToUserRecord(row));
    });
}

export function addUser(user: IUserRecord, callback: (err: Error) => void) {
    let isGuest = user.isGuest ? 1 : 0;
    db.get("SELECT username FROM users WHERE username=?", [user.username], (err, row) => {
        if (err) { callback(err) };
        if (!row) {
            db.run("INSERT INTO users (username, email, password, isGuest) VALUES(?,?,?,?)",
                    [user.username, user.email, user.password, isGuest],
                    (err) => { callback(err); }
            );
        } else {
            callback(new Error("Duplicate username."));
        }
    });
}

export function createUsersTable(callback: (err: Error) => void) {
    db.run(`CREATE TABLE IF NOT EXISTS
            users (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                   username TEXT, email TEXT, password TEXT, isGuest INTEGER) `,
            err => callback(err));
}

export function dropUsersTable(callback: (err: Error) => void) {
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
