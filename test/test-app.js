var http = require('http');
var test = require('tap-prettify').test;
var MemDOWN = require('memdown');
var levelup = require('levelup');
var request = require('request');

var app = require('../app');

function level() {
  return levelup('/', {db: function(loc) { return new MemDOWN(loc); }});
}

function appRequest(options, cb) {
  if (typeof(options) == 'string') options = {url: options};

  var server = http.createServer(app);
  app.db = options.db || level();
  server.listen(function() {
    options.url = 'http://localhost:' + server.address().port + options.url;
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
