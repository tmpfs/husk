var through = require('through3');

/**
 *  Pluck properties from an object.
 */
function Pluck(fields) {
  /* istanbul ignore next: rock solid, see plugin/pluck */
  this.fields = Array.isArray(fields) ? fields : [];
  // for toString()
  this.id = this.fields.join(',');
}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  if(chunk && typeof chunk === 'object' && this.fields.length) {
    var i, field;
    for(i = 0;i < this.fields.length;i++) {
      field = this.fields[i];
      if(typeof field === 'string' || typeof field === 'number') {
        if(chunk.hasOwnProperty(field)) {
          chunk = chunk[field];
        }
      }else if(typeof field === 'function') {
        chunk = field.call(chunk, this);
      }
    }
  }
  this.push(chunk);
  cb();
}

module.exports = through.transform(transform, {ctor: Pluck});
