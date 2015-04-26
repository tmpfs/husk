var through = require('through3')
  , file = require('./file')
  , File = file.File
  , DuplexFile = file.DuplexFile;

/**
 */
function FileIO(source, target, sopts, topts) {
  this.file = null;
  if(typeof source === 'string'
    && typeof target === 'string') {
    this.file = new DuplexFile(source, target, sopts, topts);
  }else{
    this.file = new File(source, target);
  }
  //this.source = source;
  //this.target = target;
}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  //console.log('io:' + chunk)
  if(chunk && typeof chunk === 'string') {
    this.file.path = chunk;
    this.push(this.file);
  }
  cb();
}

module.exports = through.transform(transform, {ctor: FileIO});
module.exports.File = File;
module.exports.DuplexFile = DuplexFile;
