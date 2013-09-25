var test = require('tap-prettify').test;

var testUtil = require('./lib');
var appRequest = testUtil.appRequest;
var passwordStorage = testUtil.getApp().passwordStorage;

test("GET / w/o session shows login form", function(t) {
  appRequest('/', function(err, res, body) {
    t.notOk(err);
    t.has(body, /login/);
    t.equal(res.statusCode, 200);
    t.end();
  });
});

test("GET / w/ session shows notes, logout button", function(t) {
  appRequest({
    url: '/',
    user: 'foo'
  }, function(err, res, body) {
    t.notOk(err);
    t.has(body, /logout foo/i, "logout button is visible");
    t.has(body, /update notes/i, "update notes button is visible");
    t.has(res.statusCode, 200);
    t.end();
  });
});

test("GET /blarg returns 404", function(t) {
  appRequest('/blarg', function(err, res, body) {
    t.notOk(err);
    t.has(body, /alas/i);
    t.equal(res.statusCode, 404);
    t.end();
  });
});

test("POST / w/o session returns 401", function(t) {
  appRequest({
    method: 'POST',
    url: '/'
  }, function(err, res, body) {
    t.notOk(err);
    t.equal(res.statusCode, 401);
    t.end();
  });
});

test("POST /login w/ bad credentials rejects user", function(t) {
  appRequest({
    method: 'POST',
    url: '/login',
    form: {
      username: 'meh',
      password: 'meh',
      action: 'login'
    }
  }, function(err, res, body) {
    t.notOk(err);
    t.has(body, /invalid username or password/i);
    t.equal(res.statusCode, 200);
    t.end();
  });
});

test("POST /login w/o password rejects user", function(t) {
  appRequest({
    method: 'POST',
    url: '/login',
    form: {
      username: 'meh',
      password: '',
      action: 'login'
    }
  }, function(err, res, body) {
    t.notOk(err);
    t.has(body, /provide a password/i);
    t.equal(res.statusCode, 200);
    t.end();
  });
});

test("POST /login w/ bad username rejects user", function(t) {
  appRequest({
    method: 'POST',
    url: '/login',
    form: {
      username: 'meh.',
      password: 'meh',
      action: 'login'
    }
  }, function(err, res, body) {
    t.notOk(err);
    t.has(body, /invalid username \(only/i);
    t.equal(res.statusCode, 200);
    t.end();
  });
});

test("POST /login w/ existing username rejects user", function(t) {
  appRequest({
    method: 'POST',
    url: '/login',
    form: {
      username: 'meh',
      password: 'meh',
      action: 'register'
    }
  }, function(err, res, body, db) {
    t.notOk(err);
    t.equal(res.statusCode, 200);

    appRequest({
      db: db,
      method: 'POST',
      url: '/login',
      form: {
        username: 'meh',
        password: 'meh',
        action: 'register'
      }
    }, function(err, res, body) {
      t.notOk(err);
      t.has(body, /user already exists/i);
      t.equal(res.statusCode, 200);
      t.end();
    });
  });
});

test("sessionCookie.parse() and .serialize() work", function(t) {
  var sessionCookie = testUtil.getApp().sessionCookie;

  t.deepEqual(sessionCookie.parse(sessionCookie.serialize({
    foo: 'bar'
  })), {foo: 'bar'});
  t.equal(sessionCookie.parse("LOL"), undefined);
  t.equal(sessionCookie.parse("session=LOL"), undefined);

  t.end();
});

test("passwordStorage.create() fails when acct exists", function(t) {
  var db = testUtil.level();

  passwordStorage.create(db, 'blah', 'foo', function(err) {
    t.notOk(err, "works when acct did not already exist");
    passwordStorage.create(db, 'blah', 'foo', function(err) {
      t.ok(/exists/.test(err), "reports err when acct already exists");
      t.end();
    });
  });
});

test("passwordStorage.check() works when pass doesn't exist", function(t) {
  var db = testUtil.level();

  passwordStorage.check(db, 'blah', 'meh', function(err, ok) {
    t.notOk(err);
    t.equal(ok, false);
    t.end();
  });
});

test("passwordStorage.check() returns true", function(t) {
  var db = testUtil.level();

  passwordStorage.create(db, 'blah', 'foo', function(err) {
    t.notOk(err, "works when acct did not already exist");
    passwordStorage.check(db, 'blah', 'foo', function(err, ok) {
      t.notOk(err);
      t.ok(ok, 'check returns true when password matches');
      t.end();
    });
  });
});

test("passwordStorage.check() returns false", function(t) {
  var db = testUtil.level();

  passwordStorage.create(db, 'blah', 'foo', function(err) {
    t.notOk(err, "works when acct did not already exist");
    passwordStorage.check(db, 'blah', 'FOO', function(err, ok) {
      t.notOk(err);
      t.notOk(ok, 'check returns false when password doesn\'t match ');
      t.end();
    });
  });
});
