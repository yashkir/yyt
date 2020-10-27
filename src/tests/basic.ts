import t = require('tap')
import backend = require('../db/backend')

var USERID = 'testid';

t.test('check if we are sane', t => {
    t.equal(1,1,'one is equal to one');
    //t.equal(backend.init(':memory:'), true, 'backend init() returns true');

    t.end();
});

t.test('backend adds a task and retrieves it', t => {
    backend.init(':memory:', true, (err) => {
        if (err) {
            throw err;
        }
        backend.add(USERID, "basic test string", false, (err) => {
            if (err) {
                throw err;
            }
            backend.list(USERID, (err, tasks) => {
                t.equal(tasks[0].text, "basic test string");
                t.end();
            });
        });
    });
});
