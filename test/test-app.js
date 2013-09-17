var http = require('http');
var test = require('tap-prettify').test;
var MemDOWN = require('memdown');
var levelup = require('levelup');
var request = require('request');

var app = require('../app');

var dbfactory = function (location) { return new MemDOWN(location); };

function oneRequest(options, cb) {
  if (typeof(options) == 'string') options = {url: options};

  var server = http.createServer(app);
  var db = levelup('/', {factory: dbfactory});
  app.db = db;
  server.listen(function() {
    options.url = 'http://localhost:' + server.address().port + options.url;
    request(options, function(err, res, body) {
      server.close();
      db.close(function(closeErr) {
        cb(err || closeErr, res, body);
      });
    });
  });
}

test("accessing / w/o session shows login form", function(t) {
  oneRequest('/', function(err, res, body) {
    t.notOk(err);
    t.has(body, /login/);
    t.end();
  });
});

test("accessing /blarg returns 404", function(t) {
  oneRequest('/blarg', function(err, res, body) {
    t.notOk(err);
    t.has(body, /alas/i);
    t.equal(res.statusCode, 404);
    t.end();
  });
});
