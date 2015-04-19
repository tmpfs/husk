var util = require('util')
  , fs = require('fs')
  , through = require('through3')
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

/**
 *  Read file stream duplex wrapper.
 */
function FileRead(opts) {
  opts = opts || {};
  this.opts = opts;
  this.opts.buffer = opts.buffer !== undefined ? opts.buffer : true;
}

function readTransform(chunk, encoding, cb) {
  var opts = this;
  if(typeof chunk === 'string') {
    var stream = fs.createReadStream(chunk, this.opts)
      , info = {
        path: chunk,
        opts: this.opts,
        body: new Buffer(0)
      }

    this.push(info);

    stream.once('error', this.emit.bind(this, 'error'));
    stream.on('readable', function() {
      var data = stream.read();
      if(data) {
        info.body = Buffer.concat([info.body, data]);

        // callback on every readable chunk
        if(!opts.buffer) {
          cb();
        }
      }
    })

    // buffer everything and pass downstream on file close
    stream.once('close', function() {
      stream.removeAllListeners();
      if(opts.buffer) {
        cb();
      }
    })
  // pass through
  }else{
    this.push(chunk);
    cb();
  }
}

/**
 *  Write file stream duplex wrapper.
 */
function FileWrite(method, opts) {
  opts = opts || {};
  this.method = method;
  this.opts = opts;
}

function writeTransform(chunk, encoding, cb) {
  var scope = this;
  if(typeof chunk.path === 'string'){
    var content = chunk.output || chunk.body;
    if(typeof content === 'string' || Buffer.isBuffer(content)) {
      var stream = fs.createWriteStream(chunk.path, this.opts);
      stream.once('error', this.emit.bind(this, 'error'));
      stream.once('open', function() {
        stream.end(content, function() {
          stream.removeAllListeners();
          scope.push(content);
          cb();
        });
      });
    }
  // passthrough
  }else{
    this.push(chunk);
    cb();
  }
}

FileAsync.FileRead = through.transform(readTransform, {ctor: FileRead});
FileAsync.FileWrite = through.transform(writeTransform, {ctor: FileWrite});

module.exports = FileAsync;

