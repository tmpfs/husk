var EachStream = require('each-flow');

function stream(method) {
  return new EachStream(method);
}

/**
 *  Add an each stream to the chain.
 */
function each(method) {
  return this.fuse(stream(method));
}

function plugin() {
  this.each = each;
}

stream.plugin = plugin;
module.exports = stream;
