var wdtest = require('./lib').wdtest;

wdtest.setup();

wdtest("users can register and store notes", function(t) {
  t.browser.get('/');

  // Register a user...
  t.browser.$('input[name="username"]').type("me");
  t.browser.$('input[name="password"]').type("blarg");
  t.browser.$('button[value="register"]').click();

  // Write some notes...
  t.browser.$('textarea').type("hallo, these are my notes.");
  t.browser.$('input[value="Update Notes"]').click();

  // Log out...
  t.browser.$('input[value="Logout me"]').click();

  // Log back in...
  t.browser.$('input[name="username"]').type("me");
  t.browser.$('input[name="password"]').type("blarg");
  t.browser.$('button[value="login"]').click();

  // Read our notes...
  t.equal(t.browser.$('textarea').text(), 'hallo, these are my notes.');

  // Verify that stuff was stored in our database.
  t.ok(t.db.get('password-me'));
  t.equal(t.db.get('notes-me'), 'hallo, these are my notes.');
});

wdtest.teardown();
