import express = require('express');
import handlebars = require('handlebars');
import fs = require('fs');
import backend = require('./backend');
import uuid = require('uuid');
import session = require('express-session');

const DBPATH = '/home/yashkir/tmp/test.db'; //TODO move this out
const USERID = 'yashkir55';
const SECRET = 'very secret';
const port = 8080;

backend.init(DBPATH);

let t1 = handlebars.compile(fs.readFileSync('views/index.mustache').toString());
let t2 = handlebars.compile(fs.readFileSync('views/tasks.mustache').toString());

const app = express();

app.use(express.static("public"));

app.use(session({
    genid: (req) => {
        return uuid.v4();
    },
    secret: SECRET,
    resave: false,
    saveUninitialized: true
}))

app.get('/', (req, res) => {
    console.log("Have ID: " + req.sessionID);
    res.send(t1( { name: 'test' } ));
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
