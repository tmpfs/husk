var TransformStream = require('transform-flow');

function stream(method) {
  return new TransformStream(method);
}

function plugin() {
  this.transform = function transform(method) {
    return this.fuse(stream(method));
  }
}

stream.plugin = plugin;
module.exports = stream;
