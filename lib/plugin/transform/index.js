var MethodStream = require('method-flow');

function stream() {
  var args = [].slice.call(arguments);
  return MethodStream.apply(null, args);
}

function plugin() {
  this.transform = function transform(opts) {
    return this.pipe(stream.apply(this, arguments));
  }
}

stream.plugin = plugin;
module.exports = stream;
