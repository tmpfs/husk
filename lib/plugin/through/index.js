var ThroughStream = require('through-flow');

function stream(method) {
  return new ThroughStream(method);
}

function plugin() {
  this.through = function through(method) {
    return this.fuse(stream(method));
  }
}

stream.plugin = plugin;
module.exports = stream;
