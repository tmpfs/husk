var PrintStream = require('print-flow');

function stream(method, opts) {
  method = method || console.dir;
  return new PrintStream(method, opts);
}

/**
 *  Add a print stream to the chain.
 */
function print(dest, opts) {
  if(typeof dest === 'function') {
    return this.fuse(dest(dest, opts));
  }
  dest = dest || stream(null, opts);
  return this.fuse(dest);
}

/**
 *  Debug stream chunks.
 */
function debug(opts) {
  opts = opts || {buffers: true};
  return this.print(null, opts);
}

function plugin() {
  this.print = print;
  this.debug = debug;
}

stream.plugin = plugin;
module.exports = stream;
