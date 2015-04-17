var PrintStream = require('print-flow');

function stream(stream, opts) {
  stream = stream || console.dir;
  return new PrintStream(stream, opts);
}

/**
 *  Add a print stream to the chain.
 */
function print(stream, opts) {
  if(typeof stream === 'function') {
    return this.fuse(stream(stream, opts));
  }
  return this.fuse(stream || process.stdout);
}

/**
 *  Debug stream chunks.
 */
function debug(opts) {
  opts = opts || {buffers: true};
  return this.print(console.dir, opts);
}

function plugin() {
  this.print = print;
  this.debug = debug;
}

stream.plugin = plugin;
module.exports = stream;
