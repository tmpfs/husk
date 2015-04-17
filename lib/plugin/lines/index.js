var LineStream = require('stream-lines');

function stream(opts) {
  return new LineStream(opts);
}

function plugin() {
  this.lines = function lines(opts) {
    return this.pipe(stream(opts));
  }
}

stream.plugin = plugin;
module.exports = stream;
