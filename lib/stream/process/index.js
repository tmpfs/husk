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

  this.emit('run', this.ps, cmd, args, opts);

  // already running or no valid command
  if(this.ps || !cmd) {
    return false;
  }

  //console.log('start cmd: %s', cmd);

  //
  var ps = this.ps = spawn(cmd, args, opts);
  this.in = ps.stdin;
  this.out = ps.stdout;
  this.err = ps.stderr;
  this.emit('spawn', this.ps, cmd, args, opts);

  ps.once('error', this.onError);
  ps.stdout.once('error', this.onError);
  ps.stderr.once('error', this.onError);

  // combine streams
  if(this.opts.fd === undefined) {
    ps.stdout.on('data', this.write);
    ps.stderr.on('data', this.write);
  }

  ps.once('close', function onClose(code, signal) {
    //console.log('closed on cmd: %s', cmd);
    //console.log(code);
    ps.removeAllListeners();
    ps.stdout.removeAllListeners();
    ps.stderr.removeAllListeners();
    this.emit('executed', code, signal);
  }.bind(this));

}

/**
 *  Add a stream to the pipeline.
 */
function next(stream) {
  this.children.push(stream);
  return this;
}

/**
 *  Pipe to the destination writable.
 */
function pipe(dest) {
  // source scope for the pipe call
  var src = this;

  //console.log('pipe with command %s', this.cmd);
  //console.log(dest instanceof ProcessStream);

  var children = this.children.slice(0);
  this.children = [];

  if(children.length) {
    var reader = this, writer;
    //console.log('connecting pipes (%s) (cmd: %s)', children.length, this.cmd);
    for(var i = 0;i < children.length;i++) {

      writer = children[i];

      if((writer instanceof ProcessStream)) {
        writer.once('error', this.onError);
        //if(writer.opts.fd === undefined) {
        writer._start();
        //}
      }

      if((reader instanceof ProcessStream)) {
        reader.once('error', this.onError);
        reader._start();
      }

      reader = reader.pipe(writer);
    }
  }

  // use last reader as the source for
  // the final pipe call
  if(reader) {
    src = reader;
  }

  //if(!dest) return;

  Transform.prototype.pipe.apply(src, arguments);
  this._start();

  return dest;
}

ProcessStream.prototype.pipe = pipe;
ProcessStream.prototype.next = next;
ProcessStream.prototype._transform = _transform;
ProcessStream.prototype._start = _start;

module.exports = ProcessStream;
