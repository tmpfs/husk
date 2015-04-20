var through = require('through3');

/**
 *  Calls a function with each chunk of data to be transformed.
 *
 *  This is a low level stream that passes over complete control of what
 *  data is pushed to the method. Methods are invoked in the scope of the
 *  stream and should call `this.push()`.
 *
 *  Methods may push the passed chunk or push additional chunks or mutate the
 *  chunk and push it.
 *
 *  Methods can be invoked syncronously or asynchronously depending upon the
 *  function signature.
 *
 *  Sync:
 *
 *  function()
 *  function(chunk)
 *
 *  Async:
 *
 *  function(chunk, cb)
 *  function(chunk, encoding, cb)
 *
 *  If no method is available this stream acts as a passthrough stream.
 *
 *  @param method The function to invoke.
 */
function Push(method) {
  this.method = method;
}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  var method = this.method;
  // unlike most method calls which are in the scope
  // of the chunk, this is the stream scope
  if(typeof method === 'function') {
    // sync
    if(method.length <= 1) {
      method.call(this, chunk);
      cb();
    // async
    }else if(method.length == 2) {
      method.call(this, chunk, cb);
    }else{
      method.call(this, chunk, encoding, cb);
    }
  // passthrough
  }else{
    this.push(chunk);
    cb();
  }
}

module.exports = through.transform(transform, {ctor: Push});
