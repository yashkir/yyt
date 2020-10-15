import express = require('express');
import handlebars = require('handlebars');
import fs = require('fs');
import backend = require('./backend');

const DBPATH = '/home/yashkir/tmp/test.db'; //TODO move this out
const app = express();
const port = 8080;

let t1 = handlebars.compile(fs.readFileSync('views/index.html').toString());
let t2 = handlebars.compile(fs.readFileSync('views/tasks.html').toString());

app.use(express.static("public"));

app.get('/', (req, res) => {
    res.send(t1( { name: 'test'} ));
});

app.get('/tasks', (req, res) => {
    backend.init(DBPATH);
    backend.list((tasks) => {
        res.send(t2( { tasks: tasks } ));
    });
});

app.listen(port, () => {
    console.log(`Sever running at http://localhost:${port}`);
});
