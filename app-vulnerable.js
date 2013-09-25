var http = require('http');
var url = require('url');
var querystring = require('querystring');
var level = require('levelup');

var PORT = process.env.PORT || 3000;
var VALID_USERNAME = /^([A-Za-z0-9_]+)+$/;

// These view functions all return strings of HTML.
var views = {
  401: function() { return 'You must <a href="/">log in</a> first.'; },
  404: function() { return "Alas, this is a 404."; },
  login: function(req) { return [
    '<form method="post" action="/login">',
    '  username: <input type="text" name="username" required>',
    '  password: <input type="password" name="password" required>',
    '  <button type="submit" name="action" value="login">Login</button>',
    '  <button type="submit" name="action" value="register">Register',
    '    new user</button>',
    '</form>'
  ].join('\n'); },
  notes: function(req, notes) { return [
    '<form method="post" action="/logout">',
    '  <input type="submit" value="Logout ' + req.session.user + '">',
    '</form>',
    '<form method="post">',
    '  <textarea cols="80" rows="20" name="notes">' + notes + '</textarea>',
    '  <input type="submit" value="Update Notes">',
    '</form>'
  ].join('\n'); }
};

var passwordStorage = {
  check: function(db, user, pass, cb) {
    db.get('password-' + user, function(err, v) {
      err ? (err.notFound ? cb(null, false) : cb(err)) : cb(err, v == pass);
    });
  },
  create: function(db, user, pass, cb) {
    db.get('password-' + user, function(err) {
      if (!err) return cb(new Error('exists'));
      err.notFound ? db.put('password-' + user, pass, cb) : cb(err);
    });
  }
};

var sessionCookie = {
  parse: function(cookie) {
    try {
      var match = cookie.match(/session=([A-Za-z0-9+\/]+)/);
      return JSON.parse(Buffer(match[1], 'base64'));
    } catch (e) {}
  },
  serialize: function(session) {
    return 'session=' + Buffer(JSON.stringify(session)).toString('base64');
  },
  clear: 'session=; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
};

var routes = {
  'GET /': function showLoginFormOrUserNotes(req, res) {
    if (req.query.msg)
      res.write('<hr><em>' + Buffer(req.query.msg, 'hex') + '</em><hr>\n');
    if (!req.session.user)
      return res.end(views.login(req));
    app.db.get('notes-' + req.session.user, function(err, value) {
      res.end(views.notes(req, err ? '' : value));
    });
  },
  'POST /': function updateUserNotes(req, res, next) {
    if (!req.session.user) return next(401);
    var notes = req.body.notes || '';
    app.db.put('notes-' + req.session.user, notes, function(err) {
      if (err) return next(err);

      return res.redirect("/", "Your notes were saved at " + Date() + ".");
    });
  },
  'POST /login': function authenticateAndLoginUser(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var createSession = function createSession() {
      req.session.user = username;
      res.setHeader("Set-Cookie", sessionCookie.serialize(req.session));
      return res.redirect("/");
    };

    if (!VALID_USERNAME.test(username))
      return res.redirect("/", 'Invalid username ' +
                               '(only A-Z, 0-9, and _ are allowed).');
    if (!password) return res.redirect("/", 'Please provide a password.');

    if (req.body.action == 'register')
      passwordStorage.create(app.db, username, password, function(err) {
        if (!err) return createSession();
        if (!/exists/.test(err)) return next(err);
        res.redirect("/", 'That user already exists.');
      });
    else
      passwordStorage.check(app.db, username, password, function(err, ok) {
        if (err) return next(err); else if (ok) return createSession();
        res.redirect("/", 'Invalid username or password.');
      });
  },
  'POST /logout': function logoutUser(req, res) {
    res.setHeader("Set-Cookie", sessionCookie.clear);
    return res.redirect("/");
  }
};

var app = function(req, res) {
  req.urlInfo = url.parse(req.url, true);
  req.query = req.urlInfo.query;
  req.session = sessionCookie.parse(req.headers['cookie']) || {};
  req.body = {};

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.statusCode = 200;

  var routeName = req.method + ' ' + req.urlInfo.pathname;
  var route = routes[routeName];
  var next = function next(err) {
    if (typeof(err) == 'number') {
      res.statusCode = err;
      return res.end(views[err] ? views[err](req) : err.toString());
    }
    console.error(err.stack || err);
    res.statusCode = 500;
    res.end("Sorry, something exploded.");
  };

  if (!route) return next(404);

  res.redirect = function(where, msg) {
    if (msg) where += "?msg=" + Buffer(msg).toString('hex');
    res.setHeader("Location", where);
    res.statusCode = 303;
    res.end();
  };

  if (req.method == 'POST') {
    var bodyChunks = [];

    req.on('data', bodyChunks.push.bind(bodyChunks));
    req.on('end', function() {
      var data = Buffer.concat(bodyChunks).toString();
      req.body = querystring.parse(data);
      route(req, res, next);
    });
  } else route(req, res, next);
};

module.exports = app;
module.exports.sessionCookie = sessionCookie;
module.exports.passwordStorage = passwordStorage;

if (!module.parent) {
  var server = http.createServer(app);
  app.db = level(__dirname + '/db/');
  server.listen(PORT, function() {
    console.log("listening on port " + PORT);
  });
}
