var through = require('through3')
  , crypto = require('crypto');

/**
 *  Generate a cryptographic hash for each chunk.
 */
function Hash(opts) {
  opts = opts || {};
  opts.algorithm = opts.algorithm || 'sha512';
  if(!Array.isArray(opts.algorithm)) {
    opts.algorithm = [opts.algorithm];
  }
  this.opts = opts;
}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  var scope = this
    , source = chunk
    , opts = this.opts
    , hashes;

  // looks like file object
  if(chunk && typeof chunk === 'object'
    && (chunk.contents || chunk.body)) {
    source = chunk.contents || chunk.body;
  }

  function listen() {
    if(opts.passthrough) {
      scope.push(chunk);
    }

    var list, last, map = {};
    list = opts.algorithm.map(function(algorithm) {
      var hash;
      try {
        hash = crypto.createHash(algorithm);
      }catch(e) {
        scope.emit('error', e);
      }

      if(hash) {
        hash.once('error', scope.emit.bind(scope, 'error'));
        hash.once('finish', function() {
          var h = hash.read();
          if(opts.enc) {
            h = h.toString(opts.enc);
          }
          map[algorithm] = h;
          if(opts.field && typeof chunk === 'object') {
            chunk[opts.field] = chunk[opts.field] || {};
            //console.log('assign to hash %s', algorithm);
            chunk[opts.field][algorithm] = h;
            if(hash === last) {
              scope.push(chunk);
            }
          }else{
            if(hash === last) {
              scope.push(map);
            }
          }
          if(hash === last) {
            cb();
          }
        })
      }

      return hash;
    });

    last = list[list.length - 1];

    // bad algorithms, generate no hash stream
    list = list.filter(function(h) {
      return h;
    })

    return list;
  }

  // string / buffer input
  if(typeof source === 'string' || Buffer.isBuffer(source)) {
    hashes = listen();
    hashes.forEach(function(hash) {
      hash.end(source);
    })
  // looks like a readable stream
  }else if(source && source.readable) {
    hashes = listen();
    hashes.forEach(function(hash) {
      source.pipe(hash);
    })
  // pass through
  }else{
    this.push(chunk);
    cb();
  }
}

module.exports = through.transform(transform, {ctor: Hash});
