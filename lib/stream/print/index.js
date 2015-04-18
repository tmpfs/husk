var through = require('through3');

/**
 *  Prints each chunk of data in a stream and passes it through.
 *
 *  @param method A method used to print the converted chunk (optional).
 *  @param opts Options for the stream.
 */
function Print(method, opts) {
  this.method = typeof method === 'function' ? method : console.dir;
  this.opts = opts || {};
  if(method && method.name) {
    this.id = method.name;
  }
}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  //console.log('print: ' + chunk);
  var printable = chunk;
  if(this.method !== console.dir) {
    if(this.opts.buffers && Buffer.isBuffer(chunk)) {
      printable = chunk;
    }else{
      printable = '' + chunk;
    }
  }
  this.method(printable);
  this.push(chunk);
  cb();
}

module.exports = through.transform(transform, {ctor: Print});
