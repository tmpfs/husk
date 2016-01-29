var through = require('through3')
  , zlib = require('zlib');

// (buf[, options], callback)
var types = [
  'deflate',
  'deflateRaw',
  'gzip',
  'gunzip',
  'inflate',
  'inflateRaw',
  'unzip'
];

var methods = {
  'deflate': 'createDeflate',
  'deflateRaw': 'createDeflateRaw',
  'gzip': 'createGzip',
  'gunzip': 'createGunzip',
  'inflate': 'createInflate',
  'inflateRaw': 'createInflateRaw',
  'unzip': 'createUnzip'
}

/**
 *  Transforms a chunk by either invoking a zlib convenience function if the
 *  input is a buffer (stream is paused) otherwise if a readable stream is
 *  available it is piped to a zlib stream created for the input chunk.
 *
 *  When input is a stream the chunk is passed through and callback is
 *  invoked immediately.
 */
function Zlib(opts) {
  opts = opts || {};
  this.opts = opts;
  this.type = opts.type;
}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  var source = chunk && typeof chunk === 'object'
      && (chunk.contents || chunk.body)
      ? chunk.contents || chunk.body : chunk
    , method = methods[this.type]
    , stream;

  if(!~types.indexOf(this.type)) {
    return this.emit('error',
      new Error('zlib expects a valid method type: ' + types.join(', ')));
  }

  console.dir( 'zlib transform' + chunk);

  // zlib convenience methods want buffers
  if(typeof chunk === 'string') {
    chunk = new Buffer(chunk);
  }

  if(Buffer.isBuffer(chunk)) {
    zlib[this.type](chunk, this.opts, cb);
  }else if(source && source.readable) {
    stream = zlib[method](this.opts);
    source.pipe(stream).pipe(this);

    // looks like file ref, decorate
    if(source !== chunk) {
      // update contents reference for write() method
      chunk.contents = stream;
      this.push(chunk);
    }else{
      // push writable side of pipe if input chunk was readable stream
      this.push(stream);
    }

  }else{
    this.push(chunk);
  }
  cb();
}

module.exports = through.transform(transform, {ctor: Zlib});
module.exports.types = types;
module.exports.methods = methods;
