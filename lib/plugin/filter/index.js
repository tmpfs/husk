var FilterStream = require('filter-flow');

function stream(method) {
  return new FilterStream(method);
}

function plugin() {
  this.filter = function filter(method) {
    return this.fuse(stream(method));
  }
}

stream.plugin = plugin;
module.exports = stream;
