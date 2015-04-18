var PluckStream = require('./stream');

function stream() {
  var opts =  {};
  opts.fields = [].slice.call(arguments);
  return new PluckStream(opts);
}

function plugin() {
  this.pluck = function pluck() {
    return this.fuse(stream.apply(this, arguments));
  }
}

stream.plugin = plugin;
module.exports = stream;
