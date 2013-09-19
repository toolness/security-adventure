var test = require('tap-prettify').test;

var appRequest = require('../lib').appRequest;

test("app defines a Content-Security-Policy header", function(t) {
  appRequest('/', function(err, res, body) {
    t.notOk(err);
    t.equal(res.headers['content-security-policy'],
            "default-src 'none'");
    t.end();
  });
});
