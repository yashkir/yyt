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
import * as bcrypt from 'bcrypt-nodejs';

import * as backend from './db/backend';
import * as usersDb from './db/users';

/* --------------------------------------------------------------------------
 * Constants, likely to be swapped out in the future
 * ----------------------------------------------------------------------- */
const DBPATH = '/home/yashkir/tmp/test.db'; //TODO move this out
const SECRET = 'very secret';
const port = 8080;

/* --------------------------------------------------------------------------
 * Initial setup and configuration
 * ----------------------------------------------------------------------- */
const FileStore = session_file_store(session);

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

backend.init(DBPATH);

/* --------------------------------------------------------------------------
 * Middlware
 * ----------------------------------------------------------------------- */
const app = express();

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

/* --------------------------------------------------------------------------
 * Routes
 * ----------------------------------------------------------------------- */
app.get('/', (req, res) => {
    res.render('index', {session: req.session});
});

app.get('/login', (req, res) => {
    res.render('login', {session: req.session, title: 'Login'});
});

app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (info) {
            return res.render('error', {error: info.message});
        }
        if (err)  { return next(err); }
        if (!user){ return res.redirect('/login/') }
        req.login(user, (err) => {
            if (err)  { return next(err); }
            req.session.username = user.username;
            req.session.save(err => {
                if (err) {
                    next(err);
                } else {
                    res.redirect('/tasks/');
                }
            });
        });
    })(req, res, next);
});

app.get('/logout', (req, res, next) => {
    req.logout(); //TODO session too
    req.session.username = null;
    req.session.save((err) => {
        if (err) { console.log(err); }
        res.redirect('/');
    });
});

app.get('/register', (req, res) => {
    //TODO create a table
    res.redirect('/');
});

app.get('/authtest', (req, res) => {
    if (req.isAuthenticated()) {
        return res.render('error', {error: "Authenticated is TRUE"});
    } else {
        return res.render('error', {error: "Authenticated is FALSE"});
    }
});

app.get('/tasks', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.render('error', {error: "Not Logged in!"});
    }
    backend.list(req.session.username, (err, tasks) => {
        if (err) {
            console.log(err);
            return res.render('error', {error: err})
        }
        res.render('tasks', {session: req.session, title: 'Tasks', tasks: tasks});
    });
});

app.get('/tasks/add', (req, res) => {
    let text = req.query['task_text'] as string;
    if (text.length > 0) {
        backend.add(req.session.username, text, false, (err) => {
            res.redirect('..');
        });
    } else {
        res.redirect('..');
    }
});

app.get('/tasks/:taskId/done', (req, res) => {
    backend.done(req.session.username, parseInt(req.params.taskId), true, (err) => {
        res.redirect('..');
    });
});

app.get('/tasks/:taskId/delete', (req, res) => {
    backend.del(req.session.username, parseInt(req.params.taskId), (err) => {
        res.redirect('..');
    });
});

/* --------------------------------------------------------------------------
 * Start the Server !
 * ----------------------------------------------------------------------- */
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
