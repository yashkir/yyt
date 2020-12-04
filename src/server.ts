import * as express from 'express';
import * as exphbs from 'express-handlebars';
import * as uuid from 'uuid';
import * as bodyParser from 'body-parser';
import * as session from 'express-session';
import * as sqlite3 from 'sqlite3';
import sqliteStoreFactory from 'express-session-sqlite';
import * as passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import * as bcrypt from 'bcrypt';
import * as fileUpload  from 'express-fileupload';

import * as backend from './db/backend';
import * as usersDb from './db/users';
import { cleanupSessionlessGuests } from './db/helpers';
import { router } from './router';
import { DBPATH, SECRET, COOKIE_MAX_AGE, SESSION_TTL, PORT, ADDRESS, GUEST_PREFIX, URL_PREFIX } from './config';

const app = express();
const SqliteStore = sqliteStoreFactory(session);

backend.init(DBPATH, true, (err) => {
    if (err) {
        console.log(err)
        process.exit(1);
    }
});

passport.use(new LocalStrategy(
    (username, password, done) => {
        usersDb.getUserByUsername(username, (err, user: usersDb.IUserRecord) => {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, { message: "User not found.\n" });
            }
            bcrypt.compare(password, user.password, (err, same) => {
                if (err) {
                    return done(err);
                }
                if (same) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: "Invalid Credentials.\n" });
                }
            });
        });
    })
);

passport.serializeUser((user: usersDb.IUserRecord, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    usersDb.getUserById(id as string, (err, user: usersDb.IUserRecord) => {
        if (!err) {
            done(null, user);
        } else {
            done(err, false);
        }
    });
});

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(URL_PREFIX, express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    cookie: { maxAge: COOKIE_MAX_AGE },
    genid: (req) => {
        return uuid.v4();
    },
    store: new SqliteStore({
        driver: sqlite3.Database,
        path: DBPATH,
        ttl: SESSION_TTL,
    }),
    secret: SECRET,
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
    // This is just a debugging logger
    console.log("Log> Req UUID: " + req.sessionID);
    next();
});
app.use((req, res, next) => {
    /* Set up locals for our templater. Trim the guest UUID while we
     * are at it. */
    res.locals.prefix = URL_PREFIX;
    if (req.user) {
        res.locals.isAuthenticated = req.isAuthenticated();
        res.locals.username = (req.user as usersDb.IUserRecord).username;

        let re = new RegExp(`^${GUEST_PREFIX}`);
        if (re.exec(res.locals.username)) {
            // Here we simply drop the last char (assumed to be underscore)
            res.locals.username = GUEST_PREFIX.slice(0,-1);
        }
    }
    return next();
});
app.use(fileUpload({
    limits: { fileSize: 100 * 1024 },
}));
app.use(URL_PREFIX + '/', router);
app.use(function errorMiddleware (err: Error,
                                  req: express.Request,
                                  res: express.Response,
                                  next: express.NextFunction) {
    res.render('error', { error: err });
});

setInterval(() => {
    console.log('Hourly guest cleanup.');
    cleanupSessionlessGuests();
}, 1000*60*60); //hourly

app.listen(PORT, ADDRESS, () => {
    console.log(`Server running at http://${ADDRESS}:${PORT}`);
});
