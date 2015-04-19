var through = require('through3');

function Parse(method, opts){
  this.method = method;
  this.opts = opts;
}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  var input = chunk;
  if(typeof this.method === 'function') {
    input = this.method.call(chunk, chunk, this);
  }
  if(Buffer.isBuffer(input)) {
    input = '' + input;
  }
  if(typeof input === 'string') {
    try {
      chunk = JSON.parse(input);
    }catch(e) {
      this.emit('error', e);
    }
    this.push(chunk);
  }
  cb();
}

module.exports = through.transform(transform, {ctor: Parse});
