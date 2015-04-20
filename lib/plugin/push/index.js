var PushStream = require('push-flow');

function stream(method) {
  return new PushStream(method);
}

function plugin() {
  this.push = function push(method) {
    return this.fuse(stream(method));
  }
}

stream.plugin = plugin;
module.exports = stream;
