var request = require('request');

var util = require('./util');
var app = util.getApp();

module.exports = function appRequest(options, cb) {
  var jar = request.jar();
  var session = {};

  if (typeof(options) == 'string') options = {url: options};

  if (!('followAllRedirects' in options))
    options.followAllRedirects = true;

  if (options.method == 'POST' && !options.ignoreCsrfToken) {
    session.csrfToken = "TESTING";
    if (!options.form) options.form = {};
    options.form.csrfToken = session.csrfToken;
  }
  delete options.ignoreCsrfToken;

  if ('user' in options) {
    session.user = options.user;
    delete options.user;
  }

  if (Object.keys(session).length)
    jar.add(request.cookie(app.sessionCookie.serialize(session)));

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
