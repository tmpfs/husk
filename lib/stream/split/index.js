var through = require('through3');

/**
 *  Split a string into an array.
 */
function Split(opts) {
  opts = opts || {};
  this.opts = opts;
  this.opts.ptn = opts.ptn || /\s+/;
  this.opts.trim = opts.trim !== undefined ? opts.trim : true;
  // for toString()
  this.id = '' + this.opts.ptn;
}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  if(typeof chunk === 'string') {
    if(this.opts.trim) {
      chunk = chunk.trim();
    }
    chunk = chunk.split(this.opts.ptn);
  }
  this.push(chunk);
  cb();
}

module.exports = through.transform(transform, {ctor: Split});
