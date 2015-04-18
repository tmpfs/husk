var through = require('through3');

/**
 *  Split entries in an array into arrays.
 */
function Split(opts) {
  opts = opts || {};
  this.opts = opts;
  this.opts.ptn = opts.ptn || /\s+/;
  this.opts.trim = opts.trim !== undefined ? opts.trim : true;
  this.opts.ignore = opts.ignore !== undefined ? opts.ignore : true;
}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
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

module.exports = through.transform(transform, {ctor: Split});
