var through = require('through3')
  , crypto = require('crypto');

/**
 *  Generate a cryptographic hash for each chunk.
 */
function Hash(opts) {
  opts = opts || {};
  this.algorithm = opts.algorithm || 'sha512';
  this.encoding = opts.encoding;
  this.hash = crypto.createHash(this.algorithm);
}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  var scope = this
    , source = chunk
    , hash = this.hash;

  // looks like file object
  if(chunk && typeof chunk === 'object'
    && (chunk.contents || chunk.body)) {
    source = chunk.contents || chunk.body;
  }

  function listen() {
    hash.once('error', scope.emit.bind(scope, 'error'));
    hash.once('finish', function() {
      var h = hash.read();
      if(scope.encoding) {
        h = h.toString(scope.encoding);
      }
      scope.push(h);
      cb();
    })
  }

  //console.log('transform hash: ' + this.algorithm);
  //console.log('transform hash: ' + source.readable);

  // string / buffer input
  if(typeof source === 'string' || Buffer.isBuffer(source)) {
    listen();
    hash.end(source);
  // looks like a readable stream
  }else if(source && source.readable) {
    listen();
    source.pipe(hash);
  // pass through
  }else{
    this.push(chunk);
    cb();
  }
}

module.exports = through.transform(transform, {ctor: Hash});
