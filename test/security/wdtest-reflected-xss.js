var wdtest = require('../lib').wdtest;

wdtest.setup();

wdtest("app is not vulnerable to reflected XSS", function(t) {
  var exploit = "<b>FAIL</b>";
  var html = encodeURIComponent([
    '<form method="post" action="' + t.server.baseURL + '/login">',
    '  <input type="hidden" name="username" value="' + exploit + '">',
    '  <input type="hidden" name="password" value="meh">',
    '</form>',
    '<script>document.getElementsByTagName("form")[0].submit();</script>'
  ].join(''));
  t.browser.get('data:text/html,' + html);
  t.equal(t.browser.$("body").text(), "Invalid username: <b>FAIL</b>");
});

wdtest.teardown();
