var WaitStream = require('wait-flow');

function stream(opts, method) {
  return new WaitStream(opts, method);
}

function plugin() {
  this.wait = function wait(opts, method) {
    return this.fuse(stream(opts, method));
  }
}

stream.plugin = plugin;
module.exports = stream;
