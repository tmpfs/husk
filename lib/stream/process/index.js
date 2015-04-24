var through = require('through3')
  , spawn = require('child_process').spawn;

function onError(err) {
  this.emit('error', err);
}

function onClose(code, signal) {
  //console.log('closed on cmd: %s (code: %s)', this.cmd, code);
  this.ps.removeAllListeners();
  this.ps.stdout.removeAllListeners();
  this.ps.stderr.removeAllListeners();
  this.ps = null;
  this.push(null);
  this.emit('executed', code, signal);
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
function Process(cmd, args, opts, info) {
  this.cmd = cmd;
  this.args = args || [];
  this.opts = opts || {};
  this.info = info || {};
  this.onError = onError.bind(this);
  this.onClose = onClose.bind(this);
  this.on('readable', function(){})
}

function start(chunk) {
  // already running or no valid command
  if(this.ps || !this.cmd) {
    return false;
  }

  var args = this.args.slice(0);

  //console.log('start: %s %s', this.cmd, this.args.join(' '));

  //
  if(typeof args[0] === 'function' && !args[0].length) {
    args = args[0].call(chunk);
  }

  // ensure all args are strings
  args = args.map(function(a) {
    return '' + a;
  })

  var ps = this.ps = spawn(this.cmd, args, this.opts);
  this.in = ps.stdin;
  this.out = ps.stdout;
  this.err = ps.stderr;
  this.emit('spawn', this.ps, this.cmd, args, this.opts);

  ps.once('error', this.onError);
  ps.stdout.once('error', this.onError);
  ps.stderr.once('error', this.onError);

  // don't duplicate when muted
  // piping between child processes
  if(this.info.muted === undefined) {
    // combine streams (this is where most action is!)
    ps.stdout.on('data', this.push.bind(this));
    ps.stderr.on('data', this.push.bind(this));
  }

  ps.once('close', this.onClose);
}

Process.prototype.start = start;

function transform(chunk, encoding, cb) {
  if(this.ps === undefined
    && this.info
    && this.info.previous
    && !(this.info.previous instanceof Process)) {
    this.start(chunk);
  }else{
    this.push(chunk);
    cb();
  }
}

/* for some magical reason flush must be declared */
function flush() {}

module.exports = through.transform(transform, flush, {ctor: Process});
