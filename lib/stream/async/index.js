var util = require('util')
  , Transform = require('stream').Transform;

function noop(cb){cb()};

/**
 *  Calls an async function with each chunk and passes the arguments
 *  to the callback as an array on to the next stream.
 *
 *  The array passed to the next stream will vary depending upon the callback
 *  signature.
 *
 *  @param method The function to call.
 *  @param args Fixed arguments to append after *chunk* when calling the method,
 *  the last argument will always be a callback function.
 *  @param scope A scope for the function call.
 */
function AsyncStream(method, args, scope) {
  if(!(this instanceof AsyncStream)) {
    return new AsyncStream(method, args, scope);
  }
  Transform.call(this);
  this.method = typeof method === 'function' ? method : noop;
  this.args = Array.isArray(args) ? args : [];
  this.scope = scope || null;
  this._writableState.objectMode = true;
  this._readableState.objectMode = true;
}

util.inherits(AsyncStream, Transform);

/**
 *  Transform function.
 */
function _transform(chunk, encoding, cb) {
  var stream = this;

  function complete() {
    var arr = [].slice.call(arguments);
    stream.push(arr);
    cb();
  }

  var args = this.args.slice(0);
  args.unshift(chunk);
  args.push(complete);
  this.method.apply(this.scope, args);
}

AsyncStream.prototype._transform = _transform;

module.exports = AsyncStream;
