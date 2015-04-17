var AsyncStream = require('async-stream-flow');

function stream(method, args, scope) {
  return new AsyncStream(method, args, scope);
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
