var test = require('tap-prettify').test;
var request = require('request');

var testUtil = require('./lib');
var app = require('../app');

function appRequest(options, cb) {
  if (typeof(options) == 'string') options = {url: options};

  app.db = options.db || testUtil.level();
  testUtil.serve(app, function(server) {
    options.url = server.baseURL + options.url;
    request(options, function(err, res, body) {
      server.close();
      cb(err, res, body, app.db);
    });
  });
}

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
