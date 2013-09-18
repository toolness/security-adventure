var http = require('http');
var url = require('url');
var querystring = require('querystring');
var cookie = require('cookie');
var level = require('levelup');

var PORT = process.env.PORT || 3000;
var FORM_TYPE = /^application\/x-www-form-urlencoded(;.*)?$/;
var VALID_USERNAME = /^([A-Za-z0-9_]+)+$/;

// These view functions all return strings of HTML.
var views = {
  401: function() {
    return 'You must <a href="/">log in</a> first.';
  },
  404: function(req) {
    return "Alas, I do not know anything about " +
           "<code>" + req.urlInfo.pathname + "</code>."
  },
  login: function() {
    return [
      '<form method="post" action="/login">',
      '  username: <input type="text" name="username" required>',
      '  password: <input type="password" name="password" required>',
      '  <button type="submit" name="action" value="login">Login</button>',
      '  <button type="submit" name="action" value="register">Register',
      '    new user</button>',
      '</form>'
    ].join('\n');
  },
  notes: function(req, notes) {
    return [
      '<form method="post" action="/logout">',
      '  <input type="submit" value="Logout ' + req.loggedInUser + '">',
      '</form>',
      '<form method="post">',
      '  <textarea cols="80" rows="20" name="notes">' + notes + '</textarea>',
      '  <input type="submit" value="Update Notes">',
      '</form>'
    ].join('\n');
  }
};

var routes = {
  'GET /': function showLoginFormOrUserNotes(req, res) {
    if (!req.loggedInUser)
      return res.end(views.login());
    app.db.get('notes-' + req.loggedInUser, function(err, value) {
      res.end(views.notes(req, err ? '' : value));
    });
  },
  'POST /': function updateUserNotes(req, res, next) {
    if (!req.loggedInUser) return next(401);
    var notes = req.body.notes || '';
    app.db.put('notes-' + req.loggedInUser, notes, function(err) {
      if (err) return next(err);

      return res.redirect("/");
    });
  },
  'POST /login': function authenticateAndLoginUser(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var createSession = function createSession() {
      res.setHeader("Set-Cookie", cookie.serialize('session', username, {
        maxAge: 60 * 60 * 24
      }));
      return res.redirect("/");
    };

    if (!VALID_USERNAME.test(username)) return res.end('Invalid username.');
    if (!password) return res.end('Please provide a password.');

    if (req.body.action == 'register') {
      return app.db.get('password-' + username, function(err, value) {
        if (!err)
          return res.end('That user already exists.');
        app.db.put('password-' + username, password, function(err) {
          if (err) return next(err);
          return createSession();
        });
      });
    } else {
      app.db.get('password-' + username, function(err, value) {
        if (!err && value == password)
          return createSession();
        res.end('Invalid username or password.');
      });
    }
  },
  'POST /logout': function logoutUser(req, res) {
    res.setHeader("Set-Cookie", cookie.serialize('session', '', {
                    expires: new Date(0)
                  }));
    return res.redirect("/");
  }
};

var app = function(req, res) {
  var cookies = cookie.parse(req.headers['cookie'] || '');

  req.urlInfo = url.parse(req.url);
  req.loggedInUser = cookies.session;
  req.body = {};

  res.setHeader('Content-Type', 'text/html');
  res.statusCode = 200;

  var routeName = req.method + ' ' + req.urlInfo.pathname;
  var route = routes[routeName];
  var next = function next(err) {
    if (typeof(err) == 'number') {
      res.statusCode = err;
      return res.end(views[err](req));
    }
    console.error(err.stack || err);
    res.statusCode = 500;
    res.end("Sorry, something exploded.");
  };

  if (!route) return next(404);

  res.redirect = function(where) {
    res.setHeader("Location", where);
    res.statusCode = 303;
    res.end();
  };

  if (req.method == 'POST' && FORM_TYPE.test(req.headers['content-type'])) {
    var bodyChunks = [];

    req.on('data', bodyChunks.push.bind(bodyChunks));
    req.on('end', function() {
      var data = Buffer.concat(bodyChunks).toString();
      req.body = querystring.parse(data);
      route(req, res, next);
    });
  } else {
    route(req, res, next);
  }
};

module.exports = app;

if (!module.parent) {
  var server = http.createServer(app);
  app.db = level(__dirname + '/db/');
  server.listen(PORT, function() {
    console.log("listening on port " + PORT);
  });
}
