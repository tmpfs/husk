var through = require('through3');

function Parse(opts, method){
  if(typeof opts === 'function') {
    method = opts;
    opts = null;
  }
  opts = opts || {};
  this.method = method;
  this.opts = opts;
}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  var input = chunk, output;
  if(typeof this.method === 'function') {
    input = this.method.call(chunk, this);
  }
  if(Buffer.isBuffer(input)) {
    input = '' + input;
  }
  if(typeof input === 'string') {
    try {
      output = JSON.parse(input);
      // decorate chunk
      if(this.opts.field) {
        chunk[this.opts.field] = output;
      // mutate chunk
      }else{
        chunk = output;
      }
    }catch(e) {
      this.emit('error', e);
    }
  }
  this.push(chunk);
  cb();
}

module.exports = through.transform(transform, {ctor: Parse});
