var http = require('http');
var MemDOWN = require('memdown');
var levelup = require('levelup');

exports.level = function level() {
  return levelup('/', {db: function(loc) { return new MemDOWN(loc); }});
};

exports.serve = function serve(app, cb) {
  var server = http.createServer(app);
  server.listen(function() {
    server.baseURL = 'http://localhost:' + server.address().port;
    cb(server);
  });
  return server;
};

exports.getApp = function getApp() {
  var APP_MODULE = '../../' + (process.env.APP_MODULE || 'app');
  return require(APP_MODULE);
};
