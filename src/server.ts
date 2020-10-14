import express = require('express');
import handlebars = require('handlebars');
import fs = require('fs')

const app = express()
const port = 8080

let t1 = handlebars.compile(fs.readFileSync('views/index.html').toString());

app.get('/', (req, res) => {
    res.send(t1( { name: 'test'} ));
});

app.listen(port, () => {
    console.log(`Sever running at http://localhost:${port}`);
});
