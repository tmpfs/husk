var StringifyStream = require('stringify-flow');

function stream(method, opts) {
  return new StringifyStream(method, opts);
}

function plugin() {
  this.stringify = function stringify(method, opts) {
    return this.fuse(stream(method, opts));
  }
}

stream.plugin = plugin;
module.exports = stream;
