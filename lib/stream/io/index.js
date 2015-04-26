var through = require('through3')
  , file = require('./file')
  , File = file.File
  , DuplexFile = file.DuplexFile;

/**
 */
function FileIO() {}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  this.push(chunk);
  cb();
}

module.exports = through.transform(transform, {ctor: FileIO});
module.exports.File = File;
module.exports.DuplexFile = DuplexFile;
