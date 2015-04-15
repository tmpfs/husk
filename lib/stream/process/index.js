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
  opts = opts || {};

  //console.log(cmd);

  // already running or no valid command
  if(this.ps || !cmd) {
    if(!cmd && this._stdin) {
      process.stdin.pipe(this);
      this._stdin = false;
    }
    return false;
  }

  //console.log('start: %s', cmd);

  if(this._stdin) {
    // NOTE: prior to v0.12 cannot use 'inherit' so use 0
    opts = {stdio: [0, 'pipe', 'pipe']};
  }

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
    ps.removeAllListeners();
    ps.stdout.removeAllListeners();
    ps.stderr.removeAllListeners();
    this.emit('end', code, signal);
  }.bind(this));

}

function next(stream) {
  this.children.push(stream);
}

function pipe(dest, opts) {
  var children = this.children.slice(0);
  this.children = [];
  if(children.length) {
    //console.log('connecting pipes (%s)', children.length);
    var reader = this, writer;
    for(var i = 0;i < children.length;i++) {
      writer = children[i];
      reader = reader.pipe(writer);
    }
  }

  if(dest instanceof ProcessStream) {
    //dest._start();
    dest = arguments[0] = dest.in;
  }

  var src = this;

  // use last reader as the source for
  // the final pipe call
  if(reader) {
    src = reader;
  }

  Transform.prototype.pipe.apply(src, arguments);
  this._start(this.cmd, this.args);
  return dest;
}

function run(cmd, args, cb) {
  if(typeof args === 'function') {
    cb = args;
    args = null;
  }
  var h = new ProcessStream({cmd: cmd, args: args || []});
  if(typeof cb === 'function') {
    h.once('end', cb);
  }
  return h;
}

function stdin() {
  this._stdin = true;
  return this;
}

ProcessStream.prototype.run = run;
ProcessStream.prototype.pipe = pipe;
ProcessStream.prototype.stdin = stdin;
ProcessStream.prototype.next = next;
ProcessStream.prototype._transform = _transform;
ProcessStream.prototype._start = _start;

module.exports = ProcessStream;
