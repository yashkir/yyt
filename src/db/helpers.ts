import { db } from './backend';

const guestPrefix = "Guest_";

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
                    db.run("DELETE FROM users WHERE username=?", username);
                    db.run(`DROP TABLE tasks_${username}`);
                }
                else {
                    console.log(`guest ${id} valid`)
                }
            });
        }); 
    });
}
