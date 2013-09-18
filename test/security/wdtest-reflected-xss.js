var wdtest = require('../lib').wdtest;

wdtest.setup();

wdtest("app is not vulnerable to reflected XSS on 404 page", function(t) {
  t.browser.get('/<em>FAIL</em>');
  t.equal(t.browser.$("body").text(),
          "Alas, I do not know anything about /<em>FAIL</em>.");
});

wdtest.teardown();
