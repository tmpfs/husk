var SplitStream = require('split-flow');

function stream(opts) {
  return new SplitStream(opts);
}

function plugin() {
  this.split = function split(opts) {
    return this.fuse(stream(opts));
  }
}

stream.plugin = plugin;
module.exports = stream;
