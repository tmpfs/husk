var through = require('through3')
  , assert = require('assert');

/**
 *  Calls an assert function with each chunk of data to be transformed
 *  and passes through the chunk.
 *
 *  The return value from the function is used for the assertion.
 *
 *  If the return value from the function is a string it is used as the
 *  error message for the assertion.
 *
 *  If the return value is a number an error event is emitted and the process
 *  exits with the returned exit code.
 *
 *  If the return value is an Error it is emitted as an *error* event.
 *
 *  Otherwise an assertion is performed on the return value and if the
 *  assertion fails an *error* event is emitted.
 *
 *  @param method The function to invoke.
 *  @param message The default error message for assertion failure.
 */
function Assert(method, message) {
  this.method = method;
  this.message = message || 'unknown assertion error';
}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  //console.log('assert: ' + typeof chunk);
  //console.log('assert: ' + Buffer.isBuffer(chunk));

  var message = this.message
    , ret
    , code;

  if(typeof this.method === 'function') {
    try {
      ret = this.method.call(chunk);
    // can throw too
    }catch(e) {
      ret = e;
    }

    // error message, signals failure
    if(typeof ret === 'string') {
      message = ret;
      ret = false;
    }

    //console.dir(ret);

    // can return integer to exit the process
    if(typeof ret === 'number') {
      // exit codes are uint8 and node wraps larger values to zero
      code = Math.min(parseInt(ret), 255);
      ret = new Error(message);
      ret.code = code;
      this.emit('error', ret);
      process.exit(code);
    }else if(ret instanceof Error) {
      this.emit('error', ret);
    }else{
      // assert on return value, should be truthy to pass
      try {
        assert(ret, message);
      }catch(e) {
        this.emit('error', e);
      }
    }
  }

  cb(null, chunk);
}

module.exports = through.transform(transform, {ctor: Assert});
