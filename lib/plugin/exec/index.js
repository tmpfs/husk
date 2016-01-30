var util = require('util')
  , ProcessStream = require('process-flow')
  , runner = require('husk-core').run;

function stream(cmd, argv, opts) {
  return new ProcessStream(cmd, argv, opts);
}

/**
 *  Extract a callback function from an arguments array.
 */
function callback(args) {
  args = [].slice.call(args);

  var cb
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

  var info = callback(arguments)
    , cb = info.cb
    , args = info.args
    , i;

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
  for(i = 2;i < args.length;i++) {
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

  i = this.pipeline.length - 1;
  var last = this.pipeline[i]
    , fd;

  // attempt to find last process stream in pipeline
  while(last && !(last instanceof ProcessStream)){
    last = this.pipeline[--i];
  }

  // check if it has an fd assigned
  fd = (last && last.cmd && last.info && last.info.fd !== undefined)
        ? last.info.fd : undefined;

  // link processes stdout/stderr/combine
  if(fd === 1 || fd === 2 || fd === -1) {
    stream.once('spawn', function onSpawn(/* ps */) {
      // scope is now the process stream
      // pipe both streams
      if(fd === -1 && last.out && last.err) {
        last.out.pipe(this.in);
        last.err.pipe(this.in);
      }else if(fd === 1 && last.out) {
        last.out.pipe(this.in);
      }else{
        last.err.pipe(this.in);
      }
    })
  }

  return this.fuse(stream, util.format('%s %s', cmd, argv.join(' ')));
}

// fd identifier when piping between child processes
function fd(num) {

  // last child is the previous command (reader)
  // at this point we don't know which command to pipe to.
  // the next command in the chain is not defined yet
  var last = this.pipeline[this.pipeline.length - 1];

  // (combined | stdout | stderr) -> stdin
  if(num !== -1 && num !== 1 && num !== 2) {
    this.emit('error', new Error(
      'invalid fd for process pipe, expecting: -1, 1 or 2'));
  }else if(!last) {
    this.emit('error', new Error(
      'cannot pipe from fd with no previous stream'));
  }else if(!(last instanceof ProcessStream)) {
    this.emit('error', new Error(
      'cannot pipe from fd when last stream is not a process stream'));
  }

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
 *  Start stream transformations.
 *
 *  Run processes in parallel:
 *
 *  run(true)
 *
 *  Register event listener:
 *
 *  run(function(){})
 *
 *  @param opts Run options.
 *  @param cb A callback added as a once listener for the finished event.
 */
function run(opts, cb) {
  var parallel = false
    , pipeline = this.pipeline.slice(0)
    , list = pipeline.slice()
    , first = pipeline[0]
    , next
    , kids;
    //, reader
    //, writer
    //, stream

  if(typeof opts === 'function') {
    cb = opts;
    opts = null;
  }

  if(typeof opts === 'boolean') {
    parallel = opts;
    opts = null;
  }
  opts = opts || {};

  if(opts && typeof opts.parallel === 'boolean') {
    parallel = opts.parallel;
  }

  function onExecuted() {
    next = list.shift();
    if(next instanceof ProcessStream) {
      next.once('executed', onExecuted);
      next.start();
    }else{
      //console.log('ending on non-process stream');
      // if next is not a process stream we need to call
      // end on process streams for the data to keep flowing
      //pipeline.forEach(function(s) {
        //if(s instanceof ProcessStream) {
          //s.end();
        //}
      //})
    }
  }


  if(first) {
    //console.log('run commands %s', this.pipeline.length);
    //console.log('parallel:' + parallel)
    //console.log('parallel:' + (first instanceof ProcessStream))

    // series command execution
    if(!parallel
      && (first instanceof ProcessStream)) {

      list.shift();

      first.once('executed', onExecuted);
      first.start();

      //console.log('first: ' + first)
      //console.dir(first.info)

      // NOTE: first must be started beforehand so that exec()
      // NOTE: can create the pipes correctly
      if(first.info.fd) {

        //console.log('starting first with fd: %s', first.info.fd);

        kids = list.slice(0);

        // find next process stream in chain
        while((next = kids.shift())) {
          if(next instanceof ProcessStream) {
            break;
          }
        }

          //console.log('' + next)

        // when a command has an fd id it should pipe it's fd
        // to the stdin of the next command in the chain, when
        // running in series we need to ensure the next command
        // is started at the same time as the command with fd assigned
        // for the pipe to work
        next.once('executed', onExecuted);
        next.start();
      }

    // parallel command execution
    }else if(parallel) {
      this.pipeline.forEach(function(stream) {
        if(stream instanceof ProcessStream) {
          stream.start();
        }
      })
    }
  }

  // execute default run logic
  return runner.apply(this, [opts, cb]);
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

function cd(dir) {
  try {
    process.chdir(dir);
  }catch(e) {
    this.emit('error', e);
  }
  return this;
}

function plugin(conf) {
  conf = conf || {};

  // static access, create your own shortcuts :)
  this.main.command = command.bind(this);

  // alias common commands as methods on the prototype
  if(conf.alias) {
    var aliases = typeof conf.alias === 'object' ? conf.alias : alias()
      , k;
    for(k in aliases) {
      // TODO: how to handle function name conflict
      if(this[k] === undefined) {
        this.main.command(k, aliases[k]);
      }
    }
  }

  this.run = run;

  // prototype methods
  this.exec = exec;
  this.fd = fd;

  this.cd = cd;
}

stream.run = run;
stream.alias = alias;
stream.plugin = plugin;
module.exports = stream;
