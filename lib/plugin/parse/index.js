var ParseStream = require('parse-flow');

function stream(opts, method) {
  return new ParseStream(opts, method);
}

function plugin() {
  this.parse = function parse(opts, method) {
    console.log('parse %j', opts);
    return this.fuse(stream(opts, method));
  }
}

stream.plugin = plugin;
module.exports = stream;
