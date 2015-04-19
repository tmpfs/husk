var util = require('util')
  , fs = require('fs')
  , through = require('through3')
  , Async = require('async-stream-flow');

function FilePath(path) {
  this.path = path;
}

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

/**
 *  Read file stream duplex wrapper.
 */
function FileRead(opts) {
  this.opts = opts || {};
}

function readTransform(chunk, encoding, cb) {
  var reader = this;
  if(typeof chunk === 'string') {
    var stream = fs.createReadStream(chunk, this.opts);
    stream.on('readable', function() {
      var data = stream.read();
      if(data) {
        reader.push(data);
        cb();
      }
    })
  }
}

/**
 *  Write file stream duplex wrapper.
 */
function FileWrite(opts) {
  this.opts = opts || {};
  this.stream = null;
}

function writeTransform(chunk, encoding, cb) {
  var reader = this;
  if(chunk instanceof FilePath) {
    //console.log('got file path to start write...');
    //var stream = fs.createWriteStream(chunk, this.opts);
    cb();
  }
}

FileAsync.FileRead = through.transform(readTransform, {ctor: FileRead});
FileAsync.FileWrite = through.transform(writeTransform, {ctor: FileWrite});

module.exports = FileAsync;

