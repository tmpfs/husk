var ZlibStream = require('zlib-flow');

function stream(opts) {
  return new ZlibStream(opts);
}

function plugin() {
  this.zlib = function zlib(opts) {
    if(opts && typeof opts.write === 'function') {
      return this.fuse(opts); 
    }
    return this.fuse(stream(opts));
  }

  // static stream creation functions: husk.zlib.gzip()
  var zl = {};
  ZlibStream.types.forEach(function(nm) {
    zl[nm] = function(opts) {
      opts = opts || {};
      opts.type = nm;
      return stream(opts);
    }
  })
  this.main.zlib = zl;
}

stream.plugin = plugin;
module.exports = stream;
