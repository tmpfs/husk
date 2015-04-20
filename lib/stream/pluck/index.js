var through = require('through3');

/**
 *  Pluck properties from an object.
 */
function Pluck(opts) {
  opts = opts || {};
  opts.fields = Array.isArray(opts.fields) ? opts.fields : [];
  this.opts = opts;
  // for toString()
  this.id = opts.fields.join(',');
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
          chunk = chunk[field];
        }
      }else if(typeof field === 'function') {
        chunk = field.call(chunk, chunk, this);
      }
    }
    this.push(chunk);
  }else{
    this.push(chunk);
  }
  cb();
}

module.exports = through.transform(transform, {ctor: Pluck});
