var ObjectStream = require('object-flow');

function stream(opts) {
  return new ObjectStream(opts);
}

function plugin() {
  this.object = function object(opts) {
    return this.fuse(stream(opts));
  }
}

stream.plugin = plugin;
module.exports = stream;
