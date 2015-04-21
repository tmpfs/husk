var PromptStream = require('through-flow');

function stream(method, opts) {
  return new PromptStream(method, opts);
}

function plugin() {
  this.through = function through(method, opts) {
    return this.fuse(stream(method, opts));
  }
}

stream.plugin = plugin;
module.exports = stream;
