var fork = require('child_process').fork;

var test = require('tap-prettify').test;
var appRequest = require('../lib').appRequest;

var TIMEOUT = 5000;

if (process.argv[2] == 'GO') {
  appRequest({
    method: 'POST',
    url: '/login',
    form: {
      username: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!',
      password: 'meh',
      action: 'login'
    }
  }, function(err, res, body) {
    if (err) throw err;
    if (!/invalid username:/i.test(body))
      throw new Error("unexpected body: " + body);
    process.exit(0);
  });
} else
  test("app is not vulnerable to regular expression DoS", function(t) {
    var child = fork('./test-regexp-dos', ['GO']);
    var timeout = setTimeout(function() {
      timeout = null;
      t.fail("timeout (" + TIMEOUT + "ms) exceeded");
      child.kill();
      t.end();
    }, TIMEOUT);

    child.on('exit', function(code) {
      if (timeout === null) return;
      clearTimeout(timeout);
      t.equal(code, 0);
      t.end();
    });
  });
