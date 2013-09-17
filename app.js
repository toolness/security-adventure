var http = require('http');
var url = require('url');
var querystring = require('querystring');
var cookie = require('cookie');
var level = require('level');

var db = level(__dirname + '/db/');

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
  'GET /': function(req, res) {
    if (!req.loggedInUser)
      return res.end(views.login());
    db.get('notes-' + req.loggedInUser, function(err, value) {
      res.end(views.notes(req, err ? '' : value));
    });
  },
  'POST /': function(req, res, next) {
    if (!req.loggedInUser) return next(401);
    var notes = req.body.notes || '';
    db.put('notes-' + req.loggedInUser, notes, function(err) {
      if (err) return next(err);

      return res.redirect("/");
    });
  },
  'POST /login': function(req, res, next) {
    function createSession() {
      res.setHeader("Set-Cookie",
                    cookie.serialize('session', req.body.username, {
                      maxAge: 60 * 60 * 24
                    }));
      return res.redirect("/");
    }

    if (req.body.action == 'register') {
      if (!/^[A-Za-z0-9_]+$/.test(req.body.username))
        return res.end('Invalid username.');
      return db.get('password-' + req.body.username, function(err, value) {
        if (!err)
          return res.end('That user already exists.');
        db.put('password-' + req.body.username,
               req.body.password, function(err) {
                 if (err) return next(err);
                 return createSession();
               });
      });
    } else {
      db.get('password-' + req.body.username, function(err, value) {
        if (!err && value == req.body.password)
          return createSession();
        res.end('Invalid username or password.');
      });
    }
  },
  'POST /logout': function(req, res) {
    res.setHeader("Set-Cookie", cookie.serialize('session', '', {
                    expires: new Date(0)
                  }));
    return res.redirect("/");
  }
};

var app = http.createServer(function(req, res) {
  var cookies = cookie.parse(req.headers['cookie'] || '');

  req.urlInfo = url.parse(req.url);
  req.loggedInUser = cookies.session;
  req.body = {};

  res.setHeader('Content-Type', 'text/html');
  res.statusCode = 200;

  var routeName = req.method + ' ' + req.urlInfo.pathname;
  var route = routes[routeName];
  var next = function next(err) {
    if (typeof(err) == 'number')
      return res.end(views[err](req));
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

  if (req.method == 'POST' &&
      req.headers['content-type'] == 'application/x-www-form-urlencoded') {
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
});

db.on('ready', function() {
  app.listen(3000, function() {
    console.log("LISTENING");
  });
});
