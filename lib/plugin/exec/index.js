var ProcessStream = require('process-flow');

module.exports = function plugin() {
  this.exec = function exec(cmd, argv, opts) {
    var info = this.callback(arguments)
      , cb = info.cb
      , args = info.args
      , fd;

    // read from previous process fd
    if(typeof cmd === 'number') {
      fd = args.shift();
    }

    // handle args as string arguments
    if(args[1] && !Array.isArray(args[1])) {
      args[1] = [argv];
      // gather subsequent string args
      for(var i = 2;i < args.length;i++) {
        if(typeof args[i] === 'string') {
          args[1].push(args[i]);
        }
      }
    }

    var last = args[args.length - 1];
    if(typeof last  === 'object' && !Array.isArray(last)) {
      opts = last;
    }

    var options = {
      cmd: args[0], args: args[1] || [], opts: args[2] || {}, fd: fd};
    var stream = new ProcessStream(options);

    if(typeof cb === 'function') {
      //console.log('adding listener on cmd: %s', args[0]);
      stream.once('executed', cb);
    }

    // link processes
    if(fd >= 0 && fd <= 2 && this.children.length) {
      // last child is the previous command
      var scope = this.children[this.children.length - 1];
      if(scope.cmd) {
        //console.log('join processes on fd %s', fd);
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
