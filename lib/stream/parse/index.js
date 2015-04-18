var through = require('through3');

// for toString() output
function Parse(){}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  if(chunk !== undefined) {
    try {
      chunk = JSON.parse('' + chunk);
    }catch(e) {
      this.emit('error', e);
      return cb();
    }
    this.push(chunk);
  }
  cb();
}

module.exports = through.transform(transform, {ctor: Parse});
