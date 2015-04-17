var fs = require('fs');

/**
 *  Add a file read stream to the pipeline.
 */
function read() {
  return this.fuse(fs.createReadStream.apply(fs, arguments));
}

/**
 *  Add a file write stream to the pipeline.
 */
function write() {
  return this.fuse(fs.createWriteStream.apply(fs, arguments));
}

/**
 *  Convert a named fs function that proxies to `async`.
 *
 *  @param nm The name of the fs method (and the created proxy function).
 *  @param fn An alternative name for the function.
 */
function alias(nm, fn) {
  var cmd = function proxy() {
    var args = [].slice.call(arguments);
    return this.async(fs[nm], args, fs)
  }

  //fs[nm].name = nm;

  // assign to the prototype
  this[fn] = cmd;
  // return closure
  return cmd;
}

module.exports = function plugin(conf) {
  conf = conf || {};

  this.read = read;
  this.write = write;

  // alias fs methods on the prototype using async stream
  if(conf.alias) {
    var aliases = conf.aliases || require('./aliases'), k;
    for(k in aliases) {
      alias.call(this, k, aliases[k]);
    }
  }
}
