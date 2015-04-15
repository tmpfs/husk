var util = require('util')
  , fs = require('fs')
  , Transform = require('stream').Transform
  , spawn = require('child_process').spawn;

/**
 *  Converts a process spawn to a transform stream
 *  that merges the stdout and stderr streams and writes
 *  both to the next stream in the pipeline.
 */
function ProcessStream(opts) {
  if(!(this instanceof ProcessStream)) {
    return new ProcessStream(opts);
  }
  Transform.call(this);
  this._writableState.objectMode = false;
  this._readableState.objectMode = false;
  opts = opts || {};
  this.children = [];
  this.opts = opts;
  this.cmd = opts.cmd;
  this.args = opts.args;
  this.psopts = opts.opts || {};

  function onError(err) {
    this.emit('error', err);
  }
  this.onError = onError.bind(this);
  this.write = this.write.bind(this);
}

util.inherits(ProcessStream, Transform);

/**
 *  Transform function.
 */
function _transform(chunk, encoding, cb) {
  this.push(chunk);
  cb();
}

function _start(cmd, args, opts) {

  cmd = cmd || this.cmd;
  args = args || this.args;
  opts = opts || this.psopts;

  // already running or no valid command
  if(this.ps || !cmd) {
    if(!cmd && this._stdin) {
      process.stdin.pipe(this);
      this._stdin = false;
    }
    return false;
  }

  //console.log('cmd: %s', cmd);

  //if(this._stdin || opts.stdin) {
    //console.log('piping to stdin stream: ' + opts.stdin);
    //// NOTE: prior to v0.12 cannot use 'inherit' so use 0
    //opts.stdio = [opts.stdin || 0, 'pipe', 'pipe'];
    //this._stdin = false;
  //}

  var ps = this.ps = spawn(cmd, args, opts);
  this.in = ps.stdin;
  this.out = ps.stdout;
  this.err = ps.stderr;

  ps.once('error', this.onError);
  ps.stdout.once('error', this.onError);
  ps.stderr.once('error', this.onError);

  // combine streams
  ps.stdout.on('data', this.write);
  ps.stderr.on('data', this.write);

  ps.once('close', function onClose(code, signal) {
    //console.log('closed on cmd: %s', cmd);
    ps.removeAllListeners();
    ps.stdout.removeAllListeners();
    ps.stderr.removeAllListeners();
    this.emit('end', code, signal);
  }.bind(this));

}

/**
 *  Add a stream to the pipeline.
 */
function next(stream) {
  this.children.push(stream);
}

/**
 *  Pipe to the destination writable.
 */
function pipe(dest) {
  // source scope for the pipe call
  var src = this;

  var children = this.children.slice(0);
  this.children = [];

  if(children.length) {
    //console.log('connecting pipes (%s)', children.length);
    var reader = this, writer;
    for(var i = 0;i < children.length;i++) {
      writer = children[i];
      if((writer instanceof ProcessStream)) {
        //console.log('calling start on writer...');
        writer.once('error', this.onError);
        writer._start();
      }
      if((reader instanceof ProcessStream)) {
        reader.once('error', this.onError);
        reader._start();
      }

      // two consecutive process streams, pipe to stdin of writable end
      if((writer instanceof ProcessStream)
        && (reader instanceof ProcessStream)
        && reader.cmd && writer.cmd
        && reader.out && writer.in) {
        //console.log('connect exec pipe: %s', reader.cmd);
        //console.log('connect exec pipe: %s', writer.cmd);
        reader.pipe(writer.in);
      }else{
        reader = reader.pipe(writer);
      }
    }
  }

  // use last reader as the source for
  // the final pipe call
  if(reader) {
    src = reader;
  }

  Transform.prototype.pipe.apply(src, arguments);
  this._start();

  return dest;
}

function stdin() {
  this._stdin = true;
  return this;
}

ProcessStream.prototype.pipe = pipe;
ProcessStream.prototype.stdin = stdin;
ProcessStream.prototype.next = next;
ProcessStream.prototype._transform = _transform;
ProcessStream.prototype._start = _start;

module.exports = ProcessStream;
