var util = require('util')
  , fs = require('fs')
  , Transform = require('stream').Transform
  , spawn = require('child_process').spawn;


function onError(err) {
  this.emit('error', err);
}

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

  //console.log('start on: %s', cmd);

  cmd = cmd || this.cmd;
  args = args || this.args;
  opts = opts || this.psopts;

  // emit this so we can pipe from stdin if necessary
  this.emit('run', this.ps, cmd, args, opts);

  // already running or no valid command
  if(this.ps || !cmd) {
    return false;
  }

  //
  var ps = this.ps = spawn(cmd, args, opts);
  this.in = ps.stdin;
  this.out = ps.stdout;
  this.err = ps.stderr;
  this.emit('spawn', this.ps, cmd, args, opts);

  ps.once('error', this.onError);
  ps.stdout.once('error', this.onError);
  ps.stderr.once('error', this.onError);

  // don't duplicate when piping between child processes
  if(this.opts.fd === undefined) {
    // combine streams
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
  return Transform.prototype.pipe.apply(this, arguments);
}

function print(stream) {
  return this.next(stream || process.stdout);
}

function run(parallel) {

  var children = this.children.slice(0);
  if(children.length) {
    var reader = this.children[0], writer;
    //console.log('connecting pipes (%s) (cmd: %s)', children.length, this.cmd);
    for(var i = 1;i < children.length;i++) {
      writer = children[i];
      reader.unpipe();
      reader = reader.pipe(writer);
    }
  }

  //console.log('run commands %s', this.children.length);

  // top-level has a command or should read from stdin
  if(this.cmd) {
    this._start();
  }

  if(this.stdin) {
    this.stdin();
  }

  var first = children[0];

  // series command execution
  if(!parallel && this.children.length
    && first instanceof ProcessStream) {
    children.shift();
    function onExecuted() {
      var next = children.shift();
      if(next instanceof ProcessStream) {
        next.once('executed', onExecuted);
        next._start();
      }
    }
    first.once('executed', onExecuted);
    first._start();
  // parallel command execution
  }else if(parallel) {
    //console.log('running child processes');
    this.children.forEach(function(stream) {
      if(stream instanceof ProcessStream) {
        stream._start();
      }
    })
  }
}

ProcessStream.prototype.pipe = pipe;
ProcessStream.prototype.next = next;
ProcessStream.prototype.run = run;
ProcessStream.prototype.print = print;
ProcessStream.prototype._transform = _transform;
ProcessStream.prototype._start = _start;

module.exports = ProcessStream;
