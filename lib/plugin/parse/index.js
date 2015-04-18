var ParseStream = require('parse-flow');

function stream(opts) {
  return new ParseStream(opts);
}

function plugin() {
  this.parse = function parse(opts) {
    return this.fuse(stream(opts));
  }
}

stream.plugin = plugin;
module.exports = stream;
