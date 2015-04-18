var AsyncStream = require('async-stream-flow');

function stream(method, args, type) {
  type = type || AsyncStream;
  return new type(method, args);
}

/**
 *  Add an async function call stream to the chain.
 */
function async(method, args, scope) {
  return this.fuse(stream(method, args, scope));
}

function plugin() {
  this.async = async;
}

stream.plugin = plugin;
module.exports = stream;
