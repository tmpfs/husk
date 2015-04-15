var ProcessStream = require('process-flow');

module.exports = function plugin() {
  this.exec = function exec(cmd, argv, opts) {

    // fd when piping between processes
    this.fd = function fd(num) {
      if(num !== undefined) {
        this._fd = num;
        return this;
      }
      return this._fd;
    }

    var info = this.callback(arguments)
      , cb = info.cb
      , args = info.args
      , fd = this.fd();

    //console.log('exec fd: %s', fd);

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
        if(typeof args[i] === 'string') {
          argv.push(args[i]);
        }
      }
    }

    //console.log('cmd %s', cmd);
    //console.log('args %j', argv);

    var options = {
      cmd: cmd, args: argv || [], opts: opts, fd: fd};
    var stream = new ProcessStream(options);

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

    this.next(stream);
    return this;
  }
}
