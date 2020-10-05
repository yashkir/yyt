import t = require('tap')
import backend = require('../backend')

t.test('check if we are sane', t => {
      t.equal(1,1,'one is equal to one');
      t.equal(backend.init(':memory:'), true, 'backend init() returns true');

      t.end();
});
