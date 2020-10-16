import t = require('tap')
import backend = require('../backend')

t.test('check if we are sane', t => {
    t.equal(1,1,'one is equal to one');
    //t.equal(backend.init(':memory:'), true, 'backend init() returns true');

    t.end();
});

t.test('basic db tests', childTest => {
    backend.init(':memory:', true, (err) => {
        if (err) { throw err; }
        backend.add("basic test string", false, (err) => {
            if (err) { throw err; }
            childTest.end();
        });
    );
});
