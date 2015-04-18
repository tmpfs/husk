var through = require('through3');

function transform(chunk, encoding, cb) {
  if(chunk) {
    for(var k in chunk) {
      this.push(chunk[k]);
    }
  }
  cb();
}

module.exports = through.transform(transform);
