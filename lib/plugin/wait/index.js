var WaitStream = require('wait-flow');

function stream(opts, method, writable) {
  return new WaitStream(opts, method, writable);
}

function plugin() {
  this.wait = function wait(opts, method, writable) {
    return this.fuse(stream(opts, method, writable));
  }
}

stream.plugin = plugin;
module.exports = stream;
