var util = require('util')
  , EOL = require('os').EOL
  , Transform = require('stream').Transform;

/**
 *  Convert object mode data to json output.
 */
function Stringify(opts) {
  if(!(this instanceof Stringify)) {
    return new Stringify(opts);
  }
  opts = opts || {};
  this.opts = opts;
  this.opts.indent = opts.indent !== undefined ? opts.indent : 0;
  Transform.call(this);
  this._writableState.objectMode = true;
  this._readableState.objectMode = false;
}

util.inherits(Stringify, Transform);

/**
 *  Transform function.
 */
function _transform(chunk, encoding, cb) {
  if(chunk !== undefined) {
    this.push(
      JSON.stringify(chunk, this.opts.replacer, this.opts.indent) + EOL);
  }
  cb();
}

Stringify.prototype._transform = _transform;

module.exports = Stringify;
