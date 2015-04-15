var ProcessStream = require('process-flow');

module.exports = function plugin() {
  this.exec = function exec(cmd, argv, opts) {
    var info = this.callback(arguments)
      , cb = info.cb
      , args = info.args;

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

    var options = {cmd: args[0], args: args[1] || [], opts: args[2] || {}};
    var stream = new ProcessStream(options);
    //console.log('exec stream : ' + stream);
    //console.log('exec stream : ' + stream.cmd);
    if(typeof cb === 'function') {
      stream.once('end', cb);
    }
    this.next(stream);
    return this;
  }
}
