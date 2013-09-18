var wdtest = require('./lib').wdtest;

wdtest.setup();

wdtest("users can register and store notes", function(t) {
  t.browser.get('/');
  t.browser.$('input[name="username"]').type("me");
  t.browser.$('input[name="password"]').type("blarg");
  t.browser.$('button[value="register"]').click();
  t.browser.$('textarea').type("hallo, these are my notes.");
  t.browser.$('input[value="Update Notes"]').click();
  t.browser.$('input[value="Logout me"]').click();

  t.ok(t.db.get('password-me'));
  t.equal(t.db.get('notes-me'), 'hallo, these are my notes.');
});

wdtest.teardown();
