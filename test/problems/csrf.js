var cheerio = require('cheerio');
var test = require('tap-prettify').test;

var testUtil = require('../lib');
var sessionCookie = testUtil.getApp().sessionCookie;
var appRequest = testUtil.appRequest;

// TODO: Ensure that the solution uses crypto.getRandomBytes().

test("GET / sets CSRF token in session cookie, login form", function(t) {
  appRequest('/', function(err, res, body) {
    t.notOk(err);
    var setCookieHeaders = res.headers['set-cookie'];
    t.ok(setCookieHeaders, "set-cookie header must be present");
    if (!setCookieHeaders) return t.end();
    t.equal(setCookieHeaders.length, 1,
            'one set-cookie header is provided');
    var session = sessionCookie.parse(setCookieHeaders[0]);
    t.ok(session, "session cookie exists");
    t.ok(session && session.csrfToken, "session.csrfToken exists");

    var $ = cheerio.load(body);
    t.equal($('input[name="csrfToken"]').attr("value"),
            session.csrfToken,
            '<input name="csrfToken"> should have expected value');

    t.end();
  });
});

function test403(path) {
  test("POST " + path + " without csrfToken returns 403", function(t) {
    appRequest({
      method: 'POST',
      url: '/',
      ignoreCsrfToken: true
    }, function(err, res, body) {
      t.notOk(err);
      t.equal(res.statusCode, 403);
      t.end();
    });
  });
}

test403("/");
test403("/login");
test403("/logout");
