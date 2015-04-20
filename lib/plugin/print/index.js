var PrintStream = require('print-flow');

process.stdin.toString = function() {
  return '[Stdin:Readable]';
}

function stream(method, opts) {
  method = method || console.dir;
  return new PrintStream(method, opts);
}

/**
 *  Add a print stream to the chain.
 */
function print(dest, opts) {
  dest = stream(dest || process.stdout.write.bind(process.stdout), opts);
  return this.fuse(dest);
}

/**
 *  Print stream chunks using console.dir.
 */
function debug(method, opts) {
  opts = opts || {buffers: true};
  return this.print(method || console.dir, opts);
}

function plugin() {
  this.print = print;
  this.debug = debug;
}

stream.plugin = plugin;
module.exports = stream;
