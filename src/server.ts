import express = require('express');
import pug = require('pug');

const app = express()
const port = 8080

//app.use(express.static('public'));

//app.set('view engine', 'pug');

app.get('/', (req, res) => {
    let html = pug.renderFile('views/index.pug');
    res.send(html);
    //res.render('index', {title: 'Test', message: 'message!'});
    //res.sendFile('index.html', {root:'public'});
});

app.listen(port, () => {
    console.log(`Sever running at http://localhost:${port}`);
});
