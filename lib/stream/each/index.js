var through = require('through3');

function Each(method) {
  this.method = method || function noop(){};
}

function transform(chunk, encoding, cb) {
  if(chunk) {
    var k, v;
    for(var k in chunk) {
      v = this.method.call(chunk[k], chunk, this);
      if(v !== undefined) {
        this.push(v);
      }else{
        this.push(chunk[k]);
      }
    }
  }
  cb();
}

module.exports = through.transform(transform, {ctor: Each});
