var through = require('through3');

/**
 *  Calls a function with each chunk of data to be transformed, the
 *  return value of the function is the chunk to push.
 *
 *  Function is invoked in the scope of the chunk, however with primitive
 *  types this can mutate them to an object so `chunk` is also
 *  passed as the first argument.
 *
 *  function(chunk, stream)
 *
 *  @param method The function to invoke.
 */
function Transform(method) {
  this.method = method;
  if(method && method.name) {
    this.id = method.name;
  }
}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  if(typeof this.method === 'function') {
    // mutate chunk through all function calls
    // result of first call is passed to the next
    chunk = this.method.call(chunk, this);
  }
  this.push(chunk);
  cb();
}

module.exports = through.transform(transform, {ctor: Transform});
