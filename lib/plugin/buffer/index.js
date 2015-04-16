var BufferStream = require('buffer-flow');

module.exports = function plugin() {
  this.buffer = function buffer(opts) {
    return this.pipe(new BufferStream(opts));
  }
}
