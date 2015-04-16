var ConcatStream = require('concat-flow');

module.exports = function plugin() {
  this.concat = function concat(opts, cb) {
    return this.pipe(new ConcatStream(opts, function(){console.log('finish')}));
  }
}
