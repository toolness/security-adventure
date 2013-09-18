var Fiber = require('fibers');

module.exports = function FiberLevelObject(db) {
  var self = this;

  self.get = function(key) {
    var errorToThrow = new Error('get failed for key: ' + key);
    var fiber = Fiber.current;

    db.get(key, function(err, value) {
      if (err) {
        errorToThrow.originalError = err;
        errorToThrow.message += " (" + err.message + ")";
        return fiber.throwInto(errorToThrow);
      }

      return fiber.run(value);
    });
    return Fiber.yield();
  };
};
