var util = require('util')
  , Transform = require('stream').Transform;

/**
 *  Prints each chunk of data in a stream and passes it through.
 *
 *  @param method A method used to print the converted chunk (optional).
 *  @param opts Options for the stream.
 */
function PrintStream(method, opts) {
  if(!(this instanceof PrintStream)) {
    return new PrintStream(method, opts);
  }
  Transform.call(this);
  this.method = typeof method === 'function' ? method : console.dir;
  this.opts = opts || {};
  this._writableState.objectMode = true;
  this._readableState.objectMode = true;
}

util.inherits(PrintStream, Transform);

/**
 *  Transform function.
 */
function _transform(chunk, encoding, cb) {
  var printable;
  if(this.opts.buffers && Buffer.isBuffer(chunk)) {
    printable = chunk;
  }else{
    printable = '' + chunk;
  }
  this.method(printable);
  this.push(chunk);
  cb();
}

PrintStream.prototype._transform = _transform;

module.exports = PrintStream;
