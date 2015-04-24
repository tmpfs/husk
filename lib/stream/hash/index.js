var through = require('through3')
  , crypto = require('crypto');

/**
 *  Generate a cryptographic hash for each chunk.
 */
function Hash(opts) {
  opts = opts || {};
  opts.algorithm = opts.algorithm || 'sha512';
  this.opts = opts;
}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  var scope = this
    , source = chunk
    , opts = this.opts
    , hash;

  // looks like file object
  if(chunk && typeof chunk === 'object'
    && (chunk.contents || chunk.body)) {
    source = chunk.contents || chunk.body;
  }

  function listen() {
    var hash = crypto.createHash(opts.algorithm);

    if(opts.passthrough) {
      scope.push(chunk);
    }

    hash.once('error', scope.emit.bind(scope, 'error'));
    hash.once('finish', function() {
      var h = hash.read();
      if(scope.opts.enc) {
        h = h.toString(scope.opts.enc);
      }
      scope.push(h);
      cb();
    })

    return hash;
  }

  // string / buffer input
  if(typeof source === 'string' || Buffer.isBuffer(source)) {
    hash = listen();
    hash.end(source);
  // looks like a readable stream
  }else if(source && source.readable) {
    hash = listen();
    source.pipe(hash);
  // pass through
  }else{
    this.push(chunk);
    cb();
  }
}

module.exports = through.transform(transform, {ctor: Hash});
