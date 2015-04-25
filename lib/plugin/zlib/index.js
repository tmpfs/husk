var ZlibStream = require('zlib-flow');

function stream(opts) {
  return new ZlibStream(opts);
}

function plugin() {
  this.zlib = function zlib(opts) {
    return this.fuse(stream(opts));
  }
}

stream.plugin = plugin;
module.exports = stream;
