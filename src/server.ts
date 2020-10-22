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

const FileStore = session_file_store(session);

const users: usersDb.IUserRecord[] = [
    {id: 'smgg5566', username: 'test', email: 'test@test.com', password: 'password'}
];

const DBPATH = '/home/yashkir/tmp/test.db'; //TODO move this out
const USERID = 'yashkir55';
const SECRET = 'very secret';
const port = 8080;

passport.use(new LocalStrategy(
    (username, password, done) => {
        // TODO find used based on name
        // const user = users[0];
        usersDb.getUserByUsername(DBPATH, username, (user) => {
            if (username == user.username && password == user.password) {
                console.log(`found ${user.username}`);
                return done(null, user);
            } else {
                console.log(`cant find ${user.username}`);
                return done(new Error("Can't find user"));
            }
        });
    })
);

passport.serializeUser((user: usersDb.IUserRecord, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    // TODO db call
    usersDb.getUserById(DBPATH, id as string, (user) => {
        done(null, user);
    });
    //let user;
    //if (users[0].id == id) {
       //user = users[0];
    //} else {
       //user = false;
    //}
    //done(null, user);
});
backend.init(DBPATH);

let t1 = handlebars.compile(fs.readFileSync('views/index.mustache').toString());
let t2 = handlebars.compile(fs.readFileSync('views/tasks.mustache').toString());

const app = express();

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
app.use((req, res, next) => {
    console.log("Middleware> Req ID: " + req.sessionID);
    next();
});

app.get('/', (req, res) => {
    res.send(t1( { name: 'test' } ));
});

app.get('/login', (req, res) => {
    res.send("You got login.");
});

app.post('/login', (req, res, next) => {
    //res.send("You posted to login.");
    console.log(req.body);
    passport.authenticate('local', (err, user, info) => {
        console.log(`req.session.passport: ${JSON.stringify(req.session.passport)}`)
        console.log(`req.user: ${JSON.stringify(req.user)}`)
        req.login(user, (err) => {
            console.log(`req.session.passport: ${JSON.stringify(req.session.passport)}`)
            console.log(`req.user: ${JSON.stringify(req.user)}`)
            return res.send('Logged in.');
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

app.listen(port, () => {
    console.log(`Sever running at http://localhost:${port}`);
});
