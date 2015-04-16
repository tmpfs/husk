var util = require('util')
  , Transform = require('stream').Transform;

/**
 *  Parse input as json string.
 */
function ParsePlugin(opts) {
  if(!(this instanceof ParsePlugin)) {
    return new ParsePlugin(opts);
  }
  opts = opts || {};
  this.opts = opts;
  Transform.call(this);
  this._writableState.objectMode = false;
  this._readableState.objectMode = true;
}

util.inherits(ParsePlugin, Transform);

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

ParsePlugin.prototype._transform = _transform;

module.exports = function plugin() {
  this.parse = function parse(opts) {
    return this.pipe(new ParsePlugin(opts));
  }
}
