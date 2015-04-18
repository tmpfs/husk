var util = require('util')
  , Async = require('async-stream-flow');

/**
 *  Calls an fs async function with each chunk and passes the arguments
 *  to the callback as an array on to the next stream.
 *
 *  @param method The function to call.
 */
function FileAsync() {
  Async.apply(this, arguments);

  // Do we pass chunk as first argument to the async function.
  //
  // This is an important detail of how fs async operations
  // are performed as fs.* methods typcially take either:
  //
  // * path
  // * filename
  // * fd
  //
  // As the first argument, dealing with fd arguments is done using
  // an outer async call whilst it makes more sense to read in paths
  // and filenames from the chunk for those operations.
  //
  this.sends = function(chunk) {
    //console.log('sends called: %s (%s)', chunk, typeof chunk);
    return typeof chunk === 'string';
  }

}

util.inherits(FileAsync, Async);

module.exports = FileAsync;
