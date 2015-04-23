var assert = require('assert')
  , util = require('util')
  , ProcessStream = require('process-flow');

function stream(cmd, argv, opts) {
  return new ProcessStream(cmd, argv, opts);
}

/**
 *  Extract a callback function from an arguments array.
 */
function callback(args) {
  var cb
    , args = [].slice.call(args)
    , i = args.length -1;

  while(i > 0 && !cb) {
    if(typeof args[i] === 'function' && args[i].length) {
      cb = args.pop();
      break;
    }
    i--;
  }

  var last = args[args.length - 1], opts = {};
  if(typeof last  === 'object' && !Array.isArray(last)) {
    opts = args.pop();
  }

  return {cb: cb, args: args, opts: opts};
}


/**
 *  Create a program execution stream, spawning a new child process.
 */
function exec(cmd, argv, opts) {

  var scope = this
    , info = callback(arguments)
    , cb = info.cb
    , args = info.args;

  //console.dir(argv);
  //console.dir(arguments.length);

  if(typeof argv === 'function') {
    argv = [];
  }

  cmd = args[0];
  argv = args[1];
  opts = info.opts;

  // ensure args is always an array
  if(!Array.isArray(argv)) {
    argv = argv !== undefined ? [argv] : [];
  }

  // gather subsequent arguments into argv array
  // allows flattened style declaration (without array)
  for(var i = 2;i < args.length;i++) {
    if(args[i] && typeof args[i] !== 'object') {
      argv.push(args[i]);
    }
  }

  //console.log('cmd %s', cmd);
  //console.log('args %j', argv);
  //console.dir(argv);

  var stream = new ProcessStream(cmd, argv, opts);
  if(typeof cb === 'function') {
    stream.once('executed', cb);
  }

  if(cmd === 'cd') {
    stream.once('executed', function(code, signal) {
      // keep the process cwd in sync
      try {
        process.chdir(argv[0]);
      }catch(e) {
        return stream.emit('error', e);
      }
    })
  }

  var last = this.pipeline[this.pipeline.length - 1]
    , fd = (last && last.cmd && last.info && last.info.fd !== undefined)
        ? last.info.fd : undefined;

  // link processes stdout/stderr/combine
  if(fd === 1 || fd === 2 || fd === -1) {

    stream.once('spawn', function onSpawn(ps) {
      // scope is now the process stream
      // pipe both streams
      if(fd === -1 && last.out && last.err) {
        last.out.pipe(this.in);
        last.err.pipe(this.in);
      }else if(fd === 1 && last.out) {
        last.out.pipe(this.in);
      }else if(last.err){
        last.err.pipe(this.in);
      }
    })
  }

  return this.fuse(stream, util.format('%s %s', cmd, argv.join(' ')));
}

// fd identifier when piping between child processes
function fd(num) {
  // use default -1 fd on no args
  num = num === undefined ? -1 : num;

  // (combined | stdout | stderr) -> stdin
  assert(
    num === -1 || num === 1 || num === 2,
    'invalid fd for process pipe, expecting: -1, 1 or 2');

  // last child is the previous command (reader)
  // at this point we don't know which command to pipe to.
  // the next command in the chain is not defined yet
  var last = this.pipeline[this.pipeline.length - 1];
  assert(last, 'cannot pipe from fd with no previous stream');
  assert(
    last instanceof ProcessStream,
    'cannot pipe from fd when last stream is not a process stream');

  if(last && last.info) {
    //console.log('adding muted flag:' + last)
    // flag as muted so the process stream does not pass through
    // which would cause a duplication
    last.info.muted = true;

    // assign fd to process stream info
    last.info.fd = num;
  }

  return this;
}

/**
 *  Convert a named command to a function that proxies to `exec`.
 *
 *  @param nm The name of the command (and the created proxy function).
 *  @param fn An alternative name for the function.
 */
function command(nm, fn) {
  var cmd = function proxy() {
    return this.exec.apply(
      this, [nm].concat([].slice.call(arguments)));
  }

  // assign to the prototype
  this[fn || nm] = cmd;

  // return closure
  return cmd;
}

function alias() {
  return require('./alias');
}

function plugin(conf) {
  conf = conf || {};

  // static access, create your own shortcuts :)
  this.main.command = command = command.bind(this);

  // alias common commands as methods on the prototype
  if(conf.alias) {
    var aliases = typeof conf.alias === 'object' ? conf.alias : alias()
      , k;
    for(k in aliases) {
      command(k, aliases[k]);
    }
  }

  // prototype methods
  this.exec = exec;
  this.fd = fd;
}

stream.alias = alias;

stream.plugin = plugin;
module.exports = stream;
