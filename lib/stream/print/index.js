var util = require('util')
  , Transform = require('stream').Transform;

/**
 *  Prints each chunk of data in a stream and passes it through.
 *
 *  @param method A method used to print the converted chunk (optional).
 */
function PrintStream(method) {
  if(!(this instanceof PrintStream)) {
    return new PrintStream();
  }
  Transform.call(this);
  this.method = typeof method === 'function' ? method : console.dir;
  this._writableState.objectMode = true;
  this._readableState.objectMode = true;
}

util.inherits(PrintStream, Transform);

/**
 *  Transform function.
 */
function _transform(chunk, encoding, cb) {
  this.method(chunk);
  this.push(chunk);
  cb();
}

PrintStream.prototype._transform = _transform;

module.exports = PrintStream;
