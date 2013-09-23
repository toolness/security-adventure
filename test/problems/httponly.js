var test = require('tap-prettify').test;

var appRequest = require('../lib').appRequest;

test("app sets HttpOnly cookies", function(t) {
  appRequest({
    method: 'POST',
    url: '/login',
    followAllRedirects: false,
    form: {
      username: 'hello',
      password: 'meh',
      action: 'register'
    }
  }, function(err, res, body) {
    t.notOk(err);
    var cookie = res.headers['set-cookie'];
    t.ok(/HttpOnly/.test(cookie), "cookie should be HttpOnly: " + cookie);
    t.end();
  });
});
