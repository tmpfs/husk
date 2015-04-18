var ArgvStream = require('argv-stream-flow');

function stream(opts) {
  return new ArgvStream(opts);
}

/**
 *  Add an argv stream to the chain.
 */
function argv(opts) {
  return this.fuse(stream(opts));
}

function plugin() {
  this.argv = argv;
}

stream.plugin = plugin;
module.exports = stream;
