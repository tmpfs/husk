var through = require('through3')
  , file = require('./file')
  , File = file.File
  , DuplexFile = file.DuplexFile;

/**
 */
function FileIO(opts) {
}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  //console.log('io:' + chunk)
  if(chunk && typeof chunk === 'string') {
    this.push(new DuplexFile(chunk, chunk));
  }else{
    this.push(chunk);
  }
  cb();
}

module.exports = through.transform(transform, {ctor: FileIO});
module.exports.File = File;
module.exports.DuplexFile = DuplexFile;
