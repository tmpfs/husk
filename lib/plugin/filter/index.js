var method = require('method-flow');

module.exports = function plugin() {
  this.filter = function filter() {
    var args = [true].concat([].slice.call(arguments));
    return this.pipe(method.apply(null, args));
  }
}
