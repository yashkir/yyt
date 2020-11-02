/* --------------------------------------------------------------------------
 * server
 *
 * This server is a front for the two database interfaces. We handle all
 * sessions, authentication, templating, and interaction.
 * ----------------------------------------------------------------------- */
import express = require('express');
import handlebars = require('handlebars');
import exphbs = require('express-handlebars');
import fs = require('fs');
import uuid = require('uuid');
import session = require('express-session');
import session_file_store = require('session-file-store');
import bodyParser = require('body-parser');
import passport = require('passport');
import { Strategy as LocalStrategy } from 'passport-local';
import * as bcrypt from 'bcrypt';

import * as backend from './db/backend';
import * as usersDb from './db/users';
import { router } from './router';

/* --------------------------------------------------------------------------
 * Setup
 * ----------------------------------------------------------------------- */
const DBPATH = '/home/yashkir/tmp/test.db'; //TODO move this out
const SECRET = 'very secret';
const port = 8080;

const app = express();
const FileStore = session_file_store(session);

backend.init(DBPATH);
usersDb.connectDb(DBPATH);

passport.use(new LocalStrategy(
    (username, password, done) => {
        usersDb.getUserByUsername(DBPATH, username, (err, user) => {
            if (err) {
                return done(err);
            }
            if (user && bcrypt.compareSync(password, user.password)) { //TODO
                console.log(`Authenticated ${username}`);
                return done(null, user);
            } else {
                console.log(`Can't authenticate ${username}`);
                return done(null, false, { message: "Invalid Credentials.\n" });
            }
        });
    })
);

passport.serializeUser((user: usersDb.IUserRecord, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    usersDb.getUserById(DBPATH, id as string, (err, user) => {
        if (!err) {
            done(null, user);
        } else {
            done(err, false);
        }
    });
});


/* --------------------------------------------------------------------------
 * App
 * ----------------------------------------------------------------------- */

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    genid: (req) => {
        return uuid.v4();
    },
    store: new FileStore(),
    secret: SECRET,
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
// This is just a debugging logger
app.use((req, res, next) => {
    console.log("Log> Req UUID: " + req.sessionID);
    next();
});

app.use('/', router);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
