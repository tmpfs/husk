var through = require('through3');

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
 */
function AsyncStream(method, args) {
  this.method = method;
  this.args = Array.isArray(args) ? args : [];
}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  var stream = this;
  if(typeof this.method === 'function') {
    function complete() {
      var arr = [].slice.call(arguments);
      if(arr[0] instanceof Error) {
        stream.emit('error', arr[0]);
      }
      // pass return value down the stream
      stream.push(arr);
      cb();
    }

    var args = this.args.slice(0);
    args.push(complete);
    this.method.apply(chunk, args);
  // pass through
  }else{
    this.push(chunk);
    cb();
  }
}

module.exports = through.transform(transform, {ctor: AsyncStream});
