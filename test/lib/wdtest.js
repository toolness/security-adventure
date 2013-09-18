var test = require('tap-prettify').test;
var url = require('url');
var Fiber = require('fibers');
var wd = require('wd');
var phantomWdRunner = require('phantom-wd-runner');

var FiberWebdriverObject = require('./fiber-webdriver');
var FiberLevelObject = require('./fiber-level');
var util = require('./util');
var app = require('../../app');

var WEBDRIVER_URL = process.env.WEBDRIVER_URL;

var wdOptions = url.parse(WEBDRIVER_URL || "http://localhost:4444");
var phantom = null;

function wdtest(name, cb) {
  test(name, function(t) {
    app.db = util.level();
    util.serve(app, function(server) {
      var browser = wd.remote(wdOptions);
      var tSubclass = Object.create(t);

      tSubclass.end = function() {};

      Fiber(function() {
        var fiberBrowser = new FiberWebdriverObject(browser);
        tSubclass.browser = Object.create(fiberBrowser);
        tSubclass.browser.$ = tSubclass.browser.elementByCssSelector;
        tSubclass.browser.get = function(path) {
          if (path[0] == '/') path = server.baseURL + path;
          return fiberBrowser.get(path);
        };
        tSubclass.server = server;
        tSubclass.db = new FiberLevelObject(app.db);

        try {
          tSubclass.browser.init();

          cb(tSubclass);
        } catch (e) {
          t.error(e);
        }

        browser.quit();
        server.close();
        t.end();
      }).run();
    });
  });
}

wdtest.setup = function setup() {
  if (WEBDRIVER_URL) return;
  test("setup phantom", function(t) {
    phantomWdRunner().on('listening', function() {
      phantom = this;
      t.end();
    });
  });
};

wdtest.teardown = function teardown() {
  if (WEBDRIVER_URL) return;
  test("teardown phantom", function(t) {
    phantom.kill();
    t.end();
  });
};

module.exports = wdtest;
