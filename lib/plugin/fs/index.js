var fs = require('fs')
  , FileAsync = require('fs-flow')
  , FileRead = FileAsync.FileRead
  , FileWrite = FileAsync.FileWrite;

/**
 *  Add a file read stream to the pipeline.
 */
function read(opts) {
  return this.fuse(new FileRead(opts));
}

/**
 *  Add a file write stream to the pipeline.
 */
function write(method, opts) {
  return this.fuse(new FileWrite(method, opts));
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
    //console.log('fs.%s %s', nm, args.join('  '));
    return this.async(fs[nm], args, FileAsync);
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
