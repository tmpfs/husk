var AssertStream = require('assert-flow');

function stream(method, message) {
  return new AssertStream(method, message);
}

function plugin() {
  this.assert = function assert(method, message) {
    return this.fuse(stream(method, message));
  }
}

stream.plugin = plugin;
module.exports = stream;
