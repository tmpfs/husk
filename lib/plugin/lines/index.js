var LineReader = require('stream-lines');

module.exports = function plugin() {
  this.lines = function lines(opts) {
    return this.pipe(new LineReader(opts));
  }
}
