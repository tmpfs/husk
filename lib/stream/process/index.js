var util = require('util')
  , fs = require('fs')
  , PassThrough = require('stream').PassThrough
  , spawn = require('child_process').spawn;

function onError(err) {
  this.emit('error', err);
}

/**
 *  Converts a process spawn to a transform stream
 *  that merges the stdout and stderr streams and writes
 *  both to the next stream in the pipeline.
 *
 *  @param cmd The command to execute.
 *  @param args The arguments for the command.
 *  @param opts The spawn options.
 *  @param info Additional data to associate.
 */
function ProcessStream(cmd, args, opts, info) {
  if(!(this instanceof ProcessStream)) {
    return new ProcessStream(opts);
  }

  PassThrough.call(this);
  this.cmd = cmd;
  this.args = args;
  this.opts = opts || {};
  this.info = info;

  this.onError = onError.bind(this);
  this.onClose = onClose.bind(this);
  this.write = this.write.bind(this);
}

util.inherits(ProcessStream, PassThrough);

function onClose(code, signal) {
  //console.log('closed on cmd: %s (code: %s)', this.cmd, code);
  this.ps.removeAllListeners();
  this.ps.stdout.removeAllListeners();
  this.ps.stderr.removeAllListeners();
  this.ps = null;
  this.emit('executed', code, signal);
}

function start() {

  // already running or no valid command
  if(this.ps || !this.cmd) {
    return false;
  }

  var ps = this.ps = spawn(this.cmd, this.args, this.opts);
  this.in = ps.stdin;
  this.out = ps.stdout;
  this.err = ps.stderr;
  this.emit('spawn', this.ps, this.cmd, this.args, this.opts);

  ps.once('error', this.onError);
  ps.stdout.once('error', this.onError);
  ps.stderr.once('error', this.onError);

  // don't duplicate when piping between child processes
  if(this.info.fd === undefined) {
    // combine streams (this is where most action is!)
    ps.stdout.on('data', this.write);
    ps.stderr.on('data', this.write);
  }

  ps.once('close', this.onClose);
}

ProcessStream.prototype.start = start;

module.exports = ProcessStream;
