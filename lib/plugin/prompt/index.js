var PromptStream = require('prompt-flow');

function stream(method, opts) {
  return new PromptStream(method, opts);
}

function plugin() {
  this.prompt = function prompt(method, opts) {
    return this.fuse(stream(method, opts));
  }
}

stream.plugin = plugin;
module.exports = stream;
