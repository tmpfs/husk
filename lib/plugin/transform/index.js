var method = require('method-flow');

module.exports = function plugin() {
  this.transform = function transform() {
    var args = [].slice.call(arguments);
    return this.pipe(method.apply(null, args));
  }
}
