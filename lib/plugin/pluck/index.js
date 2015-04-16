var util = require('util')
  , Transform = require('stream').Transform;

/**
 *  Parse input as json string.
 */
function PluckPlugin(opts) {
  if(!(this instanceof PluckPlugin)) {
    return new PluckPlugin(opts);
  }
  opts = opts || {};
  opts.fields = Array.isArray(opts.fields) ? opts.fields : [];
  this.opts = opts;
  Transform.call(this);
  this._writableState.objectMode = true;
  this._readableState.objectMode = true;
}

util.inherits(PluckPlugin, Transform);

/**
 *  Transform function.
 */
function _transform(chunk, encoding, cb) {
  if(chunk && typeof chunk === 'object' && this.opts.fields) {
    for(var i = 0;i < this.opts.fields.length;i++) {
      if(chunk.hasOwnProperty(this.opts.fields[i])) {
        this.push(chunk[this.opts.fields[i]]);
      }
    }
  }else{
    this.push(chunk);
  }
  cb();
}

PluckPlugin.prototype._transform = _transform;

module.exports = function plugin() {
  this.pluck = function pluck() {
    var opts = {};
    opts.fields = [].slice.call(arguments);
    return this.pipe(new PluckPlugin(opts));
  }
}
