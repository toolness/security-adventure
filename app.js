var http = require('http');
var url = require('url');
var querystring = require('querystring');
var cookie = require('cookie');
var level = require('level');

var db = level(__dirname + '/db/');

var views = {
  login: function() {
    return [
      '<form method="post" action="/login">',
      '  username: <input type="text" name="username">',
      '  password: <input type="password" name="password">',
      '  <input type="submit" value="Login">',
      '</form>'
    ].join('\n');
  },
  notes: function(username, notes) {
    return [
      '<form method="post" action="/logout">',
      '  <input type="submit" value="Logout ' + username + '">',
      '</form>',
      '<form method="post">',
      '  <textarea cols="80" rows="20" name="notes">' + notes + '</textarea>',
      '  <input type="submit" value="Update Notes">',
      '</form>'
    ].join('\n');
  }
};

var app = http.createServer(function(req, res) {
  var cookies = cookie.parse(req.headers['cookie'] || '');
  var urlInfo = url.parse(req.url);
  var loggedInUser = cookies.session;

  res.setHeader('Content-Type', 'text/html');
  res.statusCode = 200;

  if (urlInfo.pathname == '/') {
    if (loggedInUser) {
      if (req.method == 'GET') {
        return db.get('notes-' + loggedInUser, function(err, value) {
          res.end(views.notes(loggedInUser, err ? '' : value));
        });
      } else if (req.method == 'POST') {
        return parseBody(req, function(body) {
          var notes = body.notes || '';
          db.put('notes-' + loggedInUser, notes, function(err) {
            if (err) throw err;

            return redirect(res);
          });
        });
      }
    } else {
      return res.end(views.login());
    }
  } else if (urlInfo.pathname == '/login' && req.method == 'POST') {
    return parseBody(req, function(body) {
      db.get('password-' + body.username, function(err, value) {
        if (!err && value == body.password) {
          res.setHeader("Set-Cookie",
                        cookie.serialize('session', body.username, {
                          maxAge: 60 * 60 * 24
                        }));
          return redirect(res);
        }
        res.end('Invalid username or password.');
      });
    });
  } else if (urlInfo.pathname == '/logout' && req.method == 'POST') {
      res.setHeader("Set-Cookie", cookie.serialize('session', '', {
                      expires: new Date(0)
                    }));
      return redirect(res);
  }

  res.statusCode = 404;
  return res.end("Alas, I do not know anything about " +
                 "<code>" + urlInfo.pathname + "</code>.");
});

function redirect(res) {
  res.setHeader("Location", "/");
  res.statusCode = 303;
  res.end();
}

function parseBody(req, cb) {
  var chunks = [];

  req.on('data', function(chunk) { chunks.push(chunk); });
  req.on('end', function() {
    var data = Buffer.concat(chunks).toString();
    cb(querystring.parse(data));
  });
}

db.on('ready', function() {
  db.put('password-admin', 'blarg', function(err) {
    if (err) throw err;

    app.listen(3000, function() {
      console.log("LISTENING");
    });
  });
});
