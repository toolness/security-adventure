var wdtest = require('../lib').wdtest;

wdtest.setup();

wdtest("app is not vulnerable to reflected XSS", function(t) {
  var exploit = "<b>FAIL</b>";
  t.browser.get('/?msg=' + Buffer(exploit).toString('hex'));
  t.equal(t.browser.$("em").text(), exploit);
});

wdtest.teardown();
