var ProcessStream = require('process-flow');

module.exports = function plugin() {
  this.exec = function exec(cmd, args, opts) {
    var info = this.callback(arguments)
      , cb = info.cb
      , args = info.args;

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
