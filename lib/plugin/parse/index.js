var util = require('util')
  , Transform = require('stream').Transform;

/**
 *  Parse input as json string.
 */
function ParseStream(opts) {
  if(!(this instanceof ParseStream)) {
    return new ParseStream(opts);
  }
  opts = opts || {};
  this.opts = opts;
  Transform.call(this);
  this._writableState.objectMode = false;
  this._readableState.objectMode = true;
}

util.inherits(ParseStream, Transform);

/**
 *  Transform function.
 */
function _transform(chunk, encoding, cb) {
  if(chunk !== undefined) {
    try {
      chunk = JSON.parse('' + chunk);
    }catch(e) {
      this.emit('error', e);
      return cb();
    }
    this.push(chunk);
  }
  cb();
}

ParseStream.prototype._transform = _transform;

function stream(opts) {
  return new ParseStream(opts);
}

function plugin() {
  this.parse = function parse(opts) {
    return this.fuse(stream(opts));
  }
}

stream.plugin = plugin;
module.exports = stream;
