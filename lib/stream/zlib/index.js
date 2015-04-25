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

var through = require('through3')
  , zlib = require('zlib');

/**
 */
function Zlib(opts) {
  opts = opts || {};
  this.opts = opts;
  this.type = opts.type;
  if(!~types.indexOf(this.type)) {
    throw new Error('zlib expects a valid method type: ' + types.join(', '));
  }
}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  var source = chunk && typeof chunk === 'object'
    ? chunk.contents || chunk.body : null
    , method = methods[this.type]
    , stream;

  //console.log(this.type);
  //console.dir(chunk.path);

  if(typeof chunk === 'string' || Buffer.isBuffer(chunk)) {
    zlib[this.type](chunk, this.opts, cb);
  }else if(source && source.readable){
    stream = zlib[method](this.opts);
    source.pipe(stream).pipe(this);

    // update contents reference for write() method
    chunk.contents = stream;

    this.push(chunk);
    cb();
  }else{
    this.push(chunk);
    cb();
  }
}

module.exports = through.transform(transform, {ctor: Zlib});
