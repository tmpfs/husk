var util = require('util')
  , EOL = require('os').EOL
  , Transform = require('stream').Transform;

/**
 *  Split entries in an array into arrays.
 */
function SplitStream(opts) {
  if(!(this instanceof SplitStream)) {
    return new SplitStream(opts);
  }
  opts = opts || {};
  this.opts = opts;
  this.opts.ptn = opts.ptn || /\s+/;
  this.opts.trim = opts.trim !== undefined ? opts.trim : true;
  this.opts.ignore = opts.ignore !== undefined ? opts.ignore : true;
  Transform.call(this);
  this._writableState.objectMode = true;
  this._readableState.objectMode = true;
}

util.inherits(SplitStream, Transform);

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
  }else if(typeof chunk === 'string') {
    if(this.opts.trim) {
      chunk = chunk.trim();
    }
    chunk = chunk.split(this.opts.ptn);
  }
  this.push(chunk);
  cb();
}

SplitStream.prototype._transform = _transform;

function stream(opts) {
  return new SplitStream(opts);
}

function plugin() {
  this.split = function split(opts) {
    return this.pipe(stream(opts));
  }
}

stream.plugin = plugin;
module.exports = stream;
