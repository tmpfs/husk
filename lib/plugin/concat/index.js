var ConcatStream = require('concat-flow');

function stream(opts) {
  return new ConcatStream(opts);
}

function plugin() {
  this.concat = function concat(opts) {
    return this.pipe(stream(opts));
  }
}

stream.plugin = plugin;
module.exports = stream;
