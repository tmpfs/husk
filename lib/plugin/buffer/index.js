var BufferStream = require('buffer-flow');

function stream(opts) {
  return new BufferStream(opts);
}

function plugin() {
  this.buffer = function buffer(opts) {
    return this.pipe(stream(opts));
  }
}

stream.plugin = plugin;
module.exports = stream;
