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
function Async(method, args) {
  this.method = method;
  this.args = Array.isArray(args) ? args : [];

  if(method && (method.name || method.id )) {
    this.id = [method.name || method.id].concat(args).join(' ');
  }else if(this.args.length){
    this.id = 'anonymous ' + args.join(' ');
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
  var stream = this;
  if(typeof this.method === 'function') {
    function complete() {
      var arr = [].slice.call(arguments);
      if(arr[0] instanceof Error) {
        stream.emit('error', arr[0]);
      }
      //console.dir(arr);
      // pass callback arguments down the stream
      stream.push(arr);
      cb();
    }

    var args = this.argv(chunk);
    //console.log('async transform');
    //console.dir(this.method.id || this.method.name)
    //console.dir(args)
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
