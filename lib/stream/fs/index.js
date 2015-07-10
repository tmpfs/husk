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
}

util.inherits(FileAsync, Async);

function argv(chunk) {
  var args;
  if(typeof this.args[0] === 'function') {
    args = this.args[0].call(chunk);
    if(!Array.isArray(args)) {
      args = [args];
    }

    return args;
  }
  return this.args.slice(0);
}

FileAsync.prototype.argv = argv;

/**
 *  Read file stream duplex wrapper.
 */
function FileRead(opts, method) {
  if(typeof opts === 'function') {
    method = opts;
    opts = null;
  }
  opts = opts || {};
  this.opts = opts;
  this.opts.buffer = opts.buffer !== undefined ? opts.buffer : true;
  this.method = method;
}

function readTransform(chunk, encoding, cb) {
  var scope = this
    , opts = this.opts
    , args = [chunk, {}]
    , hasMethod = typeof this.method === 'function';
  if(hasMethod) {
    args = this.method.call(chunk, this);
    //if(args === undefined) {
      //args = [];
    //}else if(!Array.isArray(args)) {
      //args = [args];
    //}
  }

  //console.log(chunk);

  //console.dir(args);

  if(hasMethod || (typeof chunk === 'string')) {
    var stream = fs.createReadStream.apply(null, args)
      , info = {
        path: chunk,
        opts: opts,
        stat: null,
        body: opts.buffer ? new Buffer(0) : stream
      }

    stream.once('error', this.emit.bind(this, 'error'));

    if(opts.buffer) {
      stream.on('readable', function() {
        var data = stream.read();
        if(Buffer.isBuffer(data)) {
          info.body = Buffer.concat(
            [info.body, data], info.body.length + data.length);
        }
      })

      // buffer everything and pass downstream on file close
      stream.once('close', function() {
        stream.removeAllListeners();
        // paused whilst buffering, resume
        scope.push(info);
        cb();
      })

    }else{
      // pause read stream
      info.body.pause();

      // push file info chunk and continue
      scope.push(info);
      cb();
    }

  // pass through
  }else{
    this.push(chunk);
    cb();
  }
}

/**
 *  Write file stream duplex wrapper.
 */
function FileWrite(opts, method) {
  if(typeof opts === 'function') {
    method = opts;
    opts = null;
  }
  opts = opts || {};
  this.method = method;
  this.opts = opts;
}

function writeTransform(chunk, encoding, cb) {
  var scope = this
    , args = [chunk ? chunk.dest || chunk.path : null, this.opts]
    , hasMethod = typeof this.method === 'function';

  if(hasMethod) {
    args = this.method.call(chunk, this);
    //if(args === undefined) {
      //args = [];
    //}else if(!Array.isArray(args)) {
      //args = [args];
    //}
  }

  //console.dir(args);

  if(hasMethod || (args[0])) {
    var content = chunk.contents || chunk.body;
    var stream = fs.createWriteStream.apply(null, args);
    stream.once('error', this.emit.bind(this, 'error'));
    if(typeof content === 'string' || Buffer.isBuffer(content)) {
      stream.once('open', function() {
        stream.end(content, function() {
          stream.removeAllListeners();
          scope.push(chunk);
          cb();
        });
      });
    }else if(typeof content.resume === 'function' && content.readable) {
      chunk.dest = args[0];
      content.resume();
      content.pipe(stream);
      stream.once('finish', function() {
        stream.removeAllListeners();
        content.removeAllListeners();
        scope.push(chunk);
        cb();
      });
    // cannot handle content, expecting string, buffer or readable stream
    }else{
      this.push(chunk);
      cb();
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

