var EachStream = require('each-flow');

function stream(opts) {
  return new EachStream(opts);
}

/**
 *  Add an each stream to the chain.
 */
function each(opts) {
  return this.fuse(stream(opts));
}

function plugin() {
  this.each = each;
}

stream.plugin = plugin;
module.exports = stream;
