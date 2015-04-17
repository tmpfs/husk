var util = require('util')
  , Transform = require('stream').Transform;

/**
 *  Calls function(s) with each chunk of data to be transformed.
 */
function EachStream() {
  if(!(this instanceof EachStream)) {
    return new EachStream();
  }
  Transform.call(this);
  this._writableState.objectMode = true;
  this._readableState.objectMode = true;
}

util.inherits(EachStream, Transform);

/**
 *  Transform function.
 */
function _transform(chunk, encoding, cb) {
  if(chunk) {
    for(var k in chunk) {
      this.push(chunk[k]);
    }
  }
  cb();
}

EachStream.prototype._transform = _transform;

module.exports = EachStream;
