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
 *  @param opts Stream options.
 */
function Async(method, args, opts) {
  opts = opts || {};
  this.opts = opts;
  this.method = method;
  this.args = Array.isArray(args) ? args : [];
  if(method) {
    this.id = [method.name || method.id || ''].concat(args).join(' ');
  }
}

/**
 *  Allows subclasses to modify the final arguments passed to
 *  the function.
 */
function argv(chunk) {
  return this.args.slice(0);
}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  var stream = this
    , opts = this.opts;
  if(typeof this.method === 'function') {
    function complete() {
      var arr = [].slice.call(arguments);
      if(arr[0] instanceof Error) {
        stream.emit('error', arr[0]);
      }else if(opts.field && chunk.hasOwnProperty(opts.field)) {
        chunk[opts.field] = arr[1];
        stream.push(chunk);
      }else{
        // pass callback arguments down the stream
        stream.push(arr);
      }
      cb();
    }
    var args = this.argv(chunk);
    args.push(complete);
    this.method.apply(chunk, args);
  // pass through
  }else{
    this.push(chunk);
    cb();
  }
}

Async.prototype.argv = argv;

module.exports = through.transform(transform, {ctor: Async});
