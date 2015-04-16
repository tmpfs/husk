var ProcessStream = require('process-flow');

/**
 *  Extract a callback function from an arguments array.
 */
function callback(args) {
  var cb
    , args = [].slice.call(args)
    , i = args.length -1;

  while(i > 0 && !cb) {
    if(typeof args[i] === 'function') {
      cb = args.pop();
      break;
    }
    i--;
  }
  return {cb: cb, args: args};
}


/**
 *  Create a program execution stream, spawning a new child process.
 */
function exec(cmd, argv, opts) {

  var info = callback(arguments)
    , cb = info.cb
    , args = info.args;
    //, fd = this.fd();

  cmd = args[0];
  argv = args[1];

  var last = args[args.length - 1];
  if(typeof last  === 'object' && !Array.isArray(last)) {
    opts = args.pop();
  }
  opts = opts || {};

  // handle args as string arguments
  if(argv && !Array.isArray(argv)) {
    argv = [argv];
    // gather subsequent string args
    for(var i = 2;i < args.length;i++) {
      if(typeof args[i] !== 'object') {
        argv.push(args[i]);
      }
    }
  }

  //console.log('cmd %s', cmd);
  //console.log('args %j', argv);

  var stream = new ProcessStream(cmd, argv, opts);

  if(typeof cb === 'function') {
    stream.once('executed', cb);
  }

  this.children = this.children || [];
  var last = this.children[this.children.length - 1]
    , fd = (last && last.info && last.info.fd !== undefined)
        ? last.info.fd : undefined;

  // link processes
  if(fd >= 0 && fd <= 2 && last) {
    // last child is the previous command
    if(last && last.cmd) {

      //console.log('creating pipe between consecutive processess: ' + last.cmd);

      stream.once('spawn', function onSpawn(ps) {
        // scope is not the process stream

        //console.log('pipe on fd %s', fd);

        // pipe both streams
        if(fd === 0) {
          last.pipe(this.in);
        }else if(fd === 1 && last.out) {
          last.out.pipe(this.in);
        }else if(last.err) {
          last.err.pipe(this.in);
        }
      })
    }
  }

  return this.pipe(stream);
}

/**
 *  Change directory in this process.
 *
 *  Child processes will inherit this as the working directory
 *  when they are spawned.
 */
function cd(dir) {
  try {
    process.chdir(dir);
  }catch(e) {
    this.emit('error', e);
  }
  return this;
}

/**
 *  Print the current working directory.
 */
function pwd() {
  console.log(process.cwd());
  return this;
}

/**
 *  Convert a named command to a function that proxies to `exec`.
 *
 *  @param nm The name of the command (and the created proxy function).
 *  @param fn An alternative name for the function.
 */
function commandify(nm, fn) {
  var cmd = function proxy() {
    return this.exec.apply(
      this, [nm].concat([].slice.call(arguments)));
  }

  // assign to the prototype
  this[fn || nm] = cmd;

  // return closure
  return cmd;
}

module.exports = function plugin(conf) {
  conf = conf || {};

  // static access, create your own shortcuts :)
  this.main.commandify = commandify = commandify.bind(this);

  // prototype methods
  this.exec = exec;

  // alias common commands as methods on the prototype
  if(conf.alias) {
    var aliases = require('./aliases'), i;
    for(i = 0;i < aliases.length;i++) {
      commandify(aliases[i]);
    }
  }

  // overrides
  this.cd = cd;
  this.pwd = pwd;
}
