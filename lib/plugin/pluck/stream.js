var through = require('through3');

/**
 *  Parse input as json string.
 */
function PluckStream(opts) {
  opts = opts || {};
  opts.fields = Array.isArray(opts.fields) ? opts.fields : [];
  this.opts = opts;
}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  if(chunk && typeof chunk === 'object' && this.opts.fields) {
    var i, field;
    for(i = 0;i < this.opts.fields.length;i++) {
      field = this.opts.fields[i];
      if(typeof field === 'string' || typeof field === 'number') {
        if(chunk.hasOwnProperty(field)) {
          this.push(chunk[field]);
        }
      }else if(typeof field === 'function') {
        this.push(field.call(chunk, this));
      }
    }
  }else{
    this.push(chunk);
  }
  cb();
}

module.exports = through.transform(transform, {ctor: PluckStream});
