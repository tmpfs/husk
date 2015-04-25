var UrlStream = require('url-flow');

function stream(opts) {
  return new UrlStream(opts);
}

function plugin() {
  this.url = function url(opts) {
    return this.fuse(stream(opts));
  }
}

stream.plugin = plugin;
module.exports = stream;
