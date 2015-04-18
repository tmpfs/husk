var through = require('through3');

/**
 *  Calls function(s) with each chunk of data to be transformed.
 *
 *  By default this stream takes the return value as the chunk to push,
 *  if the first argument is a boolean true, then this transform stream acts
 *  as if the function call is a truth test, if the return value is truthy
 *  the existing chunk is pushed (not transformed).
 *
 *  @param truthy Boolean indicating function truth test (optional).
 *  @param ... Functions to invoke with each chunk.
 */
function MethodStream() {
  var args = [].slice.call(arguments);
  this.truthy = false;
  this.methods = [];
  if(typeof args[0] === 'boolean') {
    this.truthy = true;
    args.shift();
  }

  this.methods = args.filter(function(arg) {
    return typeof arg === 'function';
  })
}

function invoke(chunk) {
  var i, fn, buf = chunk;
  for(i = 0;i < this.methods.length;i++) {
    fn = this.methods[i];
    if(this.truthy) {
      if(Boolean(fn.call(chunk, chunk, this))) {
        this.push(chunk);
      }
    }else{
      // mutate chunk through all function calls
      // result of first call is passed to the next
      chunk = fn.call(chunk, this);
    }
  }

  if(!this.truthy) {
    this.push(chunk);
  }
}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  if(this.methods.length) {
    invoke.call(this, chunk);
  }else{
    this.push(chunk);
  }
  cb();
}

module.exports = through.transform(transform, {ctor: MethodStream});
