var util = require('util')
  , EOL = require('os').EOL
  , Transform = require('stream').Transform;

/**
 *  Split entries in an array into arrays.
 */
function SplitPlugin(opts) {
  if(!(this instanceof SplitPlugin)) {
    return new SplitPlugin(opts);
  }
  opts = opts || {};
  this.opts = opts;
  this.opts.ptn = opts.ptn || /\s+/;
  this.opts.ignore = opts.ignore !== undefined ? opts.ignore : true;
  Transform.call(this);
  this._writableState.objectMode = true;
  this._readableState.objectMode = true;
}

util.inherits(SplitPlugin, Transform);

/**
 *  Transform function.
 */
function _transform(chunk, encoding, cb) {
  var opts = this.opts;
  if(Array.isArray(chunk)) {
    chunk.forEach(function(item, index) {
      // ignore and remove empty lines
      if(opts.ignore && !item) {
        chunk.splice(index, 1);
        return;
      }
      chunk[index] = ('' + item).split(opts.ptn);
    })
  }
  this.push(chunk);
  cb();
}

SplitPlugin.prototype._transform = _transform;

module.exports = function plugin() {
  this.split = function split(opts) {
    //return this.pipe(new SplitPlugin(opts));
    this.next(new SplitPlugin(opts));
    return this;
  }
}
