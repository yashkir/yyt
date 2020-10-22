import express = require('express');
import handlebars = require('handlebars');
import fs = require('fs');
import uuid = require('uuid');
import session = require('express-session');
import session_file_store = require('session-file-store');
import bodyParser = require('body-parser');
import passport = require('passport');
import { Strategy as LocalStrategy } from 'passport-local';

import * as backend from './backend';
import * as usersDb from './db/users';

/* -------------------------------------------------------------------------- 
 * Constants, likely to be swapped out in the future
 * ----------------------------------------------------------------------- */
const DBPATH = '/home/yashkir/tmp/test.db'; //TODO move this out
const USERID = 'yashkir55';
const SECRET = 'very secret';
const port = 8080;

/* -------------------------------------------------------------------------- 
 * Initial setup and configuration
 * ----------------------------------------------------------------------- */
const FileStore = session_file_store(session);

passport.use(new LocalStrategy(
    (username, password, done) => {
        usersDb.getUserByUsername(DBPATH, username, (err, user) => {
            if (err) console.log(err);
            if (user && username == user.username && password == user.password) {
                console.log(`Authenticated ${username}`);
                return done(null, user);
            } else {
                console.log(`Can't authenticate ${username}`);
                return done(null, false, { message: "Invalid User.\n" });
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

backend.init(DBPATH);

// These are the only two templates we currently use
let t1 = handlebars.compile(fs.readFileSync('views/index.mustache').toString());
let t2 = handlebars.compile(fs.readFileSync('views/tasks.mustache').toString());

const app = express();

/* -------------------------------------------------------------------------- 
 * Middlware
 * ----------------------------------------------------------------------- */
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

/* -------------------------------------------------------------------------- 
 * Routes
 * ----------------------------------------------------------------------- */
app.get('/', (req, res) => {
    res.send(t1( { name: 'test' } ));
});

app.get('/login', (req, res) => {
    res.send("You got login.");
});

app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        req.login(user, (err) => {
            if (!err) {
                return res.send('Logged in.');
            } else {
                return res.redirect('/');
            }
        });
    })(req, res, next);
});

app.get('/authtest', (req, res) => {
   if (req.isAuthenticated()) {
      res.send("Authenticated is true");
   } else {
      res.redirect('/');
   }
});

app.get('/tasks', (req, res) => {
    backend.list(USERID, (tasks) => {
        res.send(t2( { tasks: tasks } ));
    });
});

app.get('/tasks/add', (req, res) => {
    let text = req.query['task_text'] as string;
    if (text.length > 0) {
        backend.add(USERID, text, false, (err) => {
            res.redirect('..');
        });
    } else {
        res.redirect('..');
    }
});

app.get('/tasks/:taskId/done', (req, res) => {
    backend.done(USERID, parseInt(req.params.taskId), true, (err) => {
        res.redirect('..');
    });
});

app.get('/tasks/:taskId/delete', (req, res) => {
    backend.del(USERID, parseInt(req.params.taskId), (err) => {
        res.redirect('..');
    });
});

/* -------------------------------------------------------------------------- 
 * Start the Server !
 * ----------------------------------------------------------------------- */
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
