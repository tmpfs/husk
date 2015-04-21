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
  var message = this.message
    , ret
    , err;
  if(typeof this.method === 'function') {
    ret = this.method.call(chunk);
    // error message, signals failure
    if(typeof ret === 'string') {
      message = ret;
    // can return integer to exit the process
    }else if(typeof ret === 'number') {
      this.emit('error', new Error(message));
      process.exit(parseInt(ret));
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
