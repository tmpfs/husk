var through = require('through3');

function Each(){}

function transform(chunk, encoding, cb) {
  if(chunk) {
    for(var k in chunk) {
      this.push(chunk[k]);
    }
  }
  cb();
}

module.exports = through.transform(transform, {ctor: Each});
