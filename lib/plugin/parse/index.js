var ParseStream = require('parse-flow');

function stream(method, opts) {
  return new ParseStream(method, opts);
}

function plugin() {
  this.parse = function parse(method, opts) {
    return this.fuse(stream(method, opts));
  }
}

stream.plugin = plugin;
module.exports = stream;
