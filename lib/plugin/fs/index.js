var fs = require('fs')
  , FileAsync = require('fs-flow')
  , FileRead = FileAsync.FileRead
  , FileWrite = FileAsync.FileWrite
  , assigns = [
    'stat'
  ];

/**
 *  Add a file read stream to the pipeline.
 */
function read(opts, method) {
  return this.fuse(new FileRead(opts, method));
}

/**
 *  Add a file write stream to the pipeline.
 */
function write(opts, method) {
  return this.fuse(new FileWrite(opts, method));
}

/**
 *  Convert a named fs function that proxies to `async`.
 *
 *  @param nm The name of the fs method (and the created proxy function).
 *  @param fn An alternative name for the function.
 */
function proxy(nm, fn) {
  var cmd = function proxy() {
    var args = [].slice.call(arguments);
    //console.log('fs.%s %s', nm, args.join('  '));
    var opts = null;
    if(~assigns.indexOf(nm)) {
      opts = {field: nm};
    }
    return this.async(fs[nm], args, opts, FileAsync);
  }

  // cannot change name of anonymous functions :(
  // so we assign an `id` which is used in toString()
  //console.dir(nm);
  if(fs[nm]) {
    fs[nm].id = nm;
  }

  // assign to the prototype
  this[fn] = cmd;

  // return closure
  return cmd;
}

function alias() {
  return require('./alias');
}

function plugin(conf) {
  conf = conf || {};

  this.read = read;
  this.write = write;

  // alias fs methods on the prototype using async stream
  if(conf.alias) {
    var aliases = typeof conf.alias === 'object' ? conf.alias : alias()
      , k;
    for(k in aliases) {
      proxy.call(this, k, aliases[k]);
    }
  }
}

plugin.read = read;
plugin.write = write;
plugin.alias = alias;

module.exports = plugin;
