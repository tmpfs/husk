var util = require('util')
  , EOL = require('os').EOL
  , Transform = require('stream').Transform;

/**
 *  Convert object mode data to json output.
 */
function Splitify(opts) {
  if(!(this instanceof Splitify)) {
    return new Splitify(opts);
  }
  opts = opts || {};
  this.opts = opts;
  this.opts.ptn = opts.ptn || /\s+/;
  this.opts.ignore = opts.ignore !== undefined ? opts.ignore : true;
  Transform.call(this);
  this._writableState.objectMode = true;
  this._readableState.objectMode = true;
}

util.inherits(Splitify, Transform);

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

Splitify.prototype._transform = _transform;

module.exports = Splitify;
