var StringifyStream = require('stringify-flow');

function stream(opts, method) {
  return new StringifyStream(opts, method);
}

function plugin() {
  this.stringify = function stringify(opts, method) {
    return this.fuse(stream(opts, method));
  }
}

stream.plugin = plugin;
module.exports = stream;
