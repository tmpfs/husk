var AsyncStream = require('async-stream-flow');

function stream(method, args, opts, type) {
  type = type || AsyncStream;
  return new type(method, args, opts);
}

/**
 *  Add an async function call stream to the chain.
 */
function async(method, args, opts, type) {
  return this.fuse(stream(method, args, opts, type));
}

function plugin() {
  this.async = async;
}

stream.plugin = plugin;
module.exports = stream;
