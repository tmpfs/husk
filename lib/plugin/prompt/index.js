var PromptStream = require('prompt-flow');

function stream(opts, method) {
  return new PromptStream(opts, method);
}

function plugin(conf) {
  conf = conf || {};
  this.prompt = function prompt(opts, method) {
    // inherit prompt settings from plugin conf
    if(typeof opts === 'function') {
      method = opts;
      opts = conf;
    }
    return this.fuse(stream(opts, method));
  }

  this.main.getPrompt = function getPrompt(info, opts) {
    opts = opts || conf;
    return PromptStream.getPrompt(info, opts);
  }
}

stream.plugin = plugin;
module.exports = stream;
