var through = require('through3');

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
  this.method = typeof method === 'function' ? method : noop;
  this.args = Array.isArray(args) ? args : [];
  this.scope = scope || null;
  this.once('finish', this.emit.bind(this, 'executed'));
}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  var stream = this;

  function complete() {
    var arr = [].slice.call(arguments);
    if(arr[0] instanceof Error) {
      stream.emit('error', arr[0]);
    }
    stream.push(arr);
    cb();
  }

  var args = this.args.slice(0);
  args.unshift(chunk);
  args.push(complete);
  this.method.apply(this.scope, args);
}

module.exports = through.transform(transform, {ctor: AsyncStream});
