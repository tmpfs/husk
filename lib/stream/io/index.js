var through = require('through3')
  , fs = require('fs')
  , file = require('./file')
  , File = file.File
  , DuplexFile = file.DuplexFile;

function load(opts) {
  opts = opts || {};

  function transform(chunk, encoding, cb) {
    // TODO: handle URLs and protocols here
    if(chunk instanceof DuplexFile) {
      chunk.stream = fs.createReadStream(chunk.path);       
    }
    cb();
  }

  var Type = through.transform(transform);
  return new Type();
}

module.exports = {
  load: load,
  File: File,
  DuplexFile: DuplexFile
}
