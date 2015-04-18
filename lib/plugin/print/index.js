var PrintStream = require('print-flow');

process.stdin.toString = function() {
  return '[Stdin:Readable]';
}

function stream(method, opts) {
  method = method || console.dir;
  //console.log('method: ' + method);
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
 *  Print stream chunks using stderr.
 */
function error(method, opts) {
  opts = opts || {};
  return this.print(method || console.error, opts);
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
  this.error = error;
  this.debug = debug;
}

stream.plugin = plugin;
module.exports = stream;
