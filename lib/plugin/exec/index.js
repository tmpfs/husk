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

  // fd when piping between processes
  this.fd = function fd(num) {
    if(num !== undefined) {
      this._fd = num;
      return this;
    }
    return this._fd;
  }

  var info = callback(arguments)
    , cb = info.cb
    , args = info.args
    , fd = this.fd();

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

  var stream = new ProcessStream(cmd, argv, opts, {fd: fd});

  if(typeof cb === 'function') {
    stream.once('executed', cb);
  }

  // link processes
  if(fd >= 0 && fd <= 2 && this.children.length) {
    // last child is the previous command
    var scope = this.children[this.children.length - 1];
    if(scope.cmd) {
      //console.log('join processes on fd %s (%s)', fd, cmd);
      stream.once('spawn', function onSpawn(ps) {
        //console.log('pipe on fd %s', fd);
        // pipe both streams
        if(fd === 0) {
          scope.pipe(this.in);
        }else if(fd === 1 && scope.out) {
          scope.out.pipe(this.in);
        }else if(scope.err) {
          scope.err.pipe(this.in);
        }
      })
    }
  }

  return this.pipe(stream);
}

module.exports = function plugin() {
  this.exec = exec;
}
