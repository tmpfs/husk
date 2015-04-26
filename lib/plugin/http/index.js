var HttpStream = require('http-flow');

function stream(opts) {
  return new HttpStream(opts);
}

function plugin() {
  this.request = function request(opts) {
    return this.fuse(stream(opts));
  }
}

stream.plugin = plugin;
module.exports = stream;
