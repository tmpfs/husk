var StringifyStream = require('stringify-flow');

function stream(opts) {
  return new StringifyStream(opts);
}

function plugin() {
  this.stringify = function stringify(opts) {
    return this.fuse(stream(opts));
  }
}

stream.plugin = plugin;
module.exports = stream;
