var HashStream = require('hash-flow');

function stream(opts) {
  return new HashStream(opts);
}

function plugin() {
  this.hash = function hash(opts) {
    return this.fuse(stream(opts));
  }
}

stream.plugin = plugin;
module.exports = stream;
