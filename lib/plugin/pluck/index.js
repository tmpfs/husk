var PluckStream = require('pluck-flow');

function stream() {
  return new PluckStream([].slice.call(arguments));
}

function plugin() {
  this.pluck = function pluck() {
    return this.fuse(stream.apply(this, arguments));
  }
}

stream.plugin = plugin;
module.exports = stream;
