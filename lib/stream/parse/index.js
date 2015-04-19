var through = require('through3');

function Parse(method, opts){
  if(typeof method === 'object') {
    opts = method;
    method = null;
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
    input = this.method.call(chunk, chunk, this);
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
    this.push(chunk);
  }
  cb();
}

module.exports = through.transform(transform, {ctor: Parse});
