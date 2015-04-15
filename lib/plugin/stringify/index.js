var util = require('util')
  , EOL = require('os').EOL
  , Transform = require('stream').Transform;

/**
 *  Convert object mode data to json output.
 */
function StringifyPlugin(opts) {
  if(!(this instanceof StringifyPlugin)) {
    return new StringifyPlugin(opts);
  }
  opts = opts || {};
  this.opts = opts;
  this.opts.indent = opts.indent !== undefined ? opts.indent : 0;
  Transform.call(this);
  this._writableState.objectMode = true;
  this._readableState.objectMode = false;
}

util.inherits(StringifyPlugin, Transform);

/**
 *  Transform function.
 */
function _transform(chunk, encoding, cb) {
  if(chunk !== undefined && !Buffer.isBuffer(chunk)) {
    chunk = JSON.stringify(
      chunk, this.opts.replacer, this.opts.indent) + EOL;
    this.push(chunk);
  }
  cb();
}

StringifyPlugin.prototype._transform = _transform;

module.exports = function plugin() {
  this.stringify = function stringify(opts) {
    return this.pipe(new StringifyPlugin(opts));
  }
}
