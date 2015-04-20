var through = require('through3');

/**
 *  Calls a function with each chunk of data to be transformed and passes
 *  through the chunk.
 *
 *  Functions are invoked in the scope of the chunk being processed,
 *  the return value of the function is ignored.
 *
 *  If no method is available this stream acts as a passthrough stream.
 *
 *  This stream is designed to be used when you wish to reference information
 *  in the current chunk or assign data to the current chunk.
 *
 *  The stream is not exposed to the function so you cannot determine how
 *  data is pushed, use the push or transform streams for that functionality.
 *
 *  @param method The function to invoke.
 */
function Through(method) {
  this.method = method;
}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  if(typeof this.method === 'function') {
    this.method.call(chunk);
  }
  this.push(chunk);
  cb();
}

module.exports = through.transform(transform, {ctor: Through});
