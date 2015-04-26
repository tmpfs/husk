var through = require('through3');

/**
 *  Prints each chunk of data in a stream and passes it through.
 *
 *  @param opts Options for the stream.
 *  @param method A method used to print the converted chunk (optional).
 */
function Print(opts, method) {
  if(typeof opts === 'function') {
    method = opts;
    opts = null;
  }
  opts = opts || {};
  this.method = typeof method === 'function' ? method : console.dir;
  this.opts = opts;
  if(method && method.name) {
    this.id = method.name;
  }
}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  var printable = chunk;

  if(chunk.readable) {
    chunk.pipe(this);
    this.push(this);
    return cb();
  }

  if(!this.opts.raw) {
    printable = '' + chunk;
  }
  this.method(printable);
  this.push(chunk);
  cb();
}

module.exports = through.transform(transform, {ctor: Print});
