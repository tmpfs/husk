var PromptStream = require('prompt-flow');

function stream(opts, method) {
  return new PromptStream(opts, method);
}

function plugin() {
  this.prompt = function prompt(opts, method) {
    return this.fuse(stream(opts, method));
  }
}

stream.plugin = plugin;
module.exports = stream;
