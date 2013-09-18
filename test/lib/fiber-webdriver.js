// This makes it easy to use Webdriver via a synchronous API in node, by
// running it in a Fiber. The Webdriver API was originally intended to
// be used in a synchronous way, fortunately, so converting async
// Webdriver calls to synchronous ones is easy.
//
// Here's a simple asynchronous webdriver example:
//
//   var browser = require('wd').remote();
//   browser.init(function(err, sessionID) {
//     browser.get("http://foo.org/", function(err) {
//       /* ... */
//     });
//   });
//
// Here's the synchronous version:
//
//   Fiber(function() {
//     var browser = FiberWebdriverObject(require('wd').remote());
//     var sessionID = browser.init();
//     browser.get("http://foo.org");
//     /* ... */
//   }).run();
//
// Keep in mind that the synchronous version isn't *actually* blocking
// the entire process/thread, it's just running in a Fiber.

var Fiber = require('fibers');
var elementConstructor = require('wd/lib/element').element;

function wrapObject(obj) {
  if (Array.isArray(obj))
    return obj.map(wrapObject);
  if (obj instanceof elementConstructor)
    return new FiberWebdriverObject(obj);
  return obj;
}

function unwrapObject(obj) {
  if (Array.isArray(obj))
    return obj.map(unwrapObject);
  if (obj instanceof FiberWebdriverObject)
    return obj._asyncWebdriverObject;
  return obj;
}

function FiberWebdriverObject(asyncWebdriverObject) {
  var self = this;
  var methodNames = Object.keys(Object.getPrototypeOf(asyncWebdriverObject))
    .filter(function(name) {
      return (typeof(asyncWebdriverObject[name]) == "function" &&
              name[0] != '_');
    });

  self._asyncWebdriverObject = asyncWebdriverObject;
  methodNames.forEach(function(name) {
    self[name] = function() {
      var method = asyncWebdriverObject[name];
      var fiber = Fiber.current;
      var args = unwrapObject([].slice.call(arguments));

      // If this fails, the traceback that led to this function call
      // will likely be more useful than the traceback of the exception
      // that's ultimately passed to us, so we'll generate an exception
      // now just in case one happens later.
      var errorToThrow = new Error(name + " failed");

      args.push(function(err, result) {
        if (err) {
          errorToThrow.originalError = err;
          errorToThrow.message += " (" + err.message + ")";
          return fiber.throwInto(errorToThrow);
        }

        return fiber.run(wrapObject(result));
      });
      method.apply(asyncWebdriverObject, args);
      return Fiber.yield();
    };
  });
}

module.exports = FiberWebdriverObject;
