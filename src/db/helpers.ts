import * as bcrypt from 'bcrypt';
import * as backend from './backend';
import * as users from './users';
import { db } from './backend';

const guestPrefix = "Guest_";
const saltRounds = 10;

export function deleteUserAndDropTable (username: string) {
    db.serialize(() => {
        db.run("DELETE FROM users WHERE username=?", username);
        db.run(`DROP TABLE IF EXISTS tasks_${username}`);
    });
}

export function cleanupSessionlessGuests(): void {
    db.all("SELECT id, username FROM users WHERE isGuest=1", (err: Error, rows: any[]) => {
        if (err) { return console.log(err) }
        rows.forEach( (row) => {
            let username = row.username;
            let id = row.username.replace(guestPrefix, '').replace(/_/g, '-');

            db.get("SELECT data FROM sessions WHERE sid=?", [id], (err, row) => {
                if (err) { return console.log(err); };
                if (!row) {
                    console.log(`${id} guest session not found, deleting and dropping table`)
                    deleteUserAndDropTable(username);
                }
                else {
                    console.log(`guest ${id} valid`)
                }
            });
        });
    });
}

export function makeUserAndTable(user: users.IUserRecord, callback: (err: Error) => void) {
    bcrypt.hash(user.password, saltRounds, (err, hash) => {
        if (err) {
            callback(err);
        } else {
            user.password = hash;
            users.addUser(user, (err) => {
                if (err) {
                    callback(err);
                } else {
                    backend.create_table_for_user(user.username, (err) => {
                        if (err) {
                            callback(err);
                        } else {
                            callback(null);
                        }
                    });
                }
            });
        }
    });
}
