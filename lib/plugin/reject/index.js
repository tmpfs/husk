var RejectStream = require('reject-flow');

function stream(method) {
  return new RejectStream(method);
}

function plugin() {
  this.reject = function reject(method) {
    return this.fuse(stream(method));
  }
}

stream.plugin = plugin;
module.exports = stream;
