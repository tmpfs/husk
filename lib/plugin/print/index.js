var PrintStream = require('print-flow');

process.stdin.toString = function() {
  return '[Stdin:Readable]';
}

function stream(opts, method) {
  return new PrintStream(opts, method);
}

/**
 *  Add a print stream to the chain.
 */
function print(opts, dest) {
  dest = stream(opts, dest || process.stdout.write.bind(process.stdout));
  return this.fuse(dest);
}

/**
 *  Print stream chunks using console.dir.
 */
function debug(opts, method) {
  if(typeof opts === 'function') {
    method = opts;
    opts = null;
  }
  opts = opts || {raw: true};
  return this.print(opts, method || console.dir);
}

function plugin() {
  this.print = print;
  this.debug = debug;
}

stream.plugin = plugin;
module.exports = stream;
