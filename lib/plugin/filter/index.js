var MethodStream = require('method-flow');

function stream() {
  var args = [true].concat([].slice.call(arguments));
  return MethodStream.apply(null, args);
}

function plugin() {
  this.filter = function filter() {
    return this.fuse(stream.apply(this, arguments));
  }
}

stream.plugin = plugin;
module.exports = stream;
