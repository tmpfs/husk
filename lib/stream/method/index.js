var util = require('util')
  , Transform = require('stream').Transform;

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
  if(!(this instanceof MethodStream)) {
    return new MethodStream([].slice.call(arguments));
  }
  Transform.call(this);
  var args = Array.isArray(arguments[0])
    ? arguments[0] : [].slice.call(arguments);
  this.truthy = false;
  this.methods = [];
  if(typeof args[0] === 'boolean') {
    this.truthy = true;
    args.shift();
  }

  this.methods = args.filter(function(arg) {
    return typeof arg === 'function';
  })

  this._writableState.objectMode = true;
  this._readableState.objectMode = true;
}

util.inherits(MethodStream, Transform);

function invoke(chunk) {
  var i, fn;
  for(i = 0;i < this.methods.length;i++) {
    fn = this.methods[i];
    if(this.truthy) {
      if(fn.call(chunk, this)) {
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
function _transform(chunk, encoding, cb) {
  if(this.methods.length) {
    if(Array.isArray(chunk)) {
      chunk.forEach(invoke.bind(this));
    }else{
      invoke.call(this, chunk);
    }
  }else{
    this.push(chunk);
  }
  cb();
}

MethodStream.prototype._transform = _transform;

module.exports = MethodStream;
