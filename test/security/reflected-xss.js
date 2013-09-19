var wdtest = require('../lib').wdtest;

wdtest.setup();

wdtest("app is not vulnerable to reflected XSS", function(t) {
  var exploit = "<b>FAIL</b>";
  t.browser.get('/?msg=' + encodeURIComponent(exploit));
  t.equal(t.browser.$("p").text(), exploit);
});

wdtest.teardown();
