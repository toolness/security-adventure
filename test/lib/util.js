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
  var defaultModule = process.env.npm_lifecycle_event == "test"
                      ? 'app-vulnerable'
                      : 'app';
  var APP_MODULE = '../../' + (process.env.APP_MODULE || defaultModule);
  return require(APP_MODULE);
};
