var test = require('tap-prettify').test;

var appRequest = require('./lib').appRequest;

test("GET / w/o session shows login form", function(t) {
  appRequest('/', function(err, res, body) {
    t.notOk(err);
    t.has(body, /login/);
    t.equal(res.statusCode, 200);
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
