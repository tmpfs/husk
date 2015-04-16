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
    return new MethodStream(opts);
  }
  Transform.call(this);
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

  this._writableState.objectMode = true;
  this._readableState.objectMode = true;
}

util.inherits(MethodStream, Transform);

/**
 *  Transform function.
 */
function _transform(chunk, encoding, cb) {
  if(this.methods.length) {
    var i, fn;
    for(i = 0;i < this.methods.length;i++) {
      fn = this.methods[i];
      if(this.truthy && fn.call(chunk, this)) {
        this.push(chunk);
      }else{
        this.push(fn.call(chunk, this));
      }
    }
  }else{
    this.push(chunk);
  }
  cb();
}

MethodStream.prototype._transform = _transform;

module.exports = MethodStream;
