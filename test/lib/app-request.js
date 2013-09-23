var request = require('request');

var util = require('./util');
var app = util.getApp();

module.exports = function appRequest(options, cb) {
  var jar = request.jar();

  if (typeof(options) == 'string') options = {url: options};

  if (!('followAllRedirects' in options))
    options.followAllRedirects = true;

  if ('user' in options) {
    jar.add(request.cookie(app.sessionCookie.serialize({
      user: options.user
    })));
    delete options.user;
  }

  options.jar = jar;
  app.db = options.db || util.level();
  delete options.db;
  util.serve(app, function(server) {
    options.url = server.baseURL + options.url;
    request(options, function(err, res, body) {
      server.close();
      cb(err, res, body, app.db);
    });
  });
};
