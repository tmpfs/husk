var through = require('through3')
  , fs = require('fs')
  , file = require('./file')
  , File = file.File
  , DuplexFile = file.DuplexFile;

/**
 *  Create a new file input.
 */
function FileIO(opts) {
  this.opts = opts;
}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  if(chunk && typeof chunk === 'string') {
    this.push(new DuplexFile(chunk, chunk));
  }else{
    this.push(chunk);
  }
  cb();
}

function load(opts) {
  opts = opts || {};

  function transform(chunk, encoding, cb) {
    //console.dir('load transform called');
    //console.dir(chunk);
    if(chunk instanceof DuplexFile) {
      chunk.stream = fs.createReadStream(chunk.path);       
    }
    cb();
  }

  //console.dir('load called: ');

  var Type = through.transform(transform);
  return new Type();
}

module.exports = through.transform(transform, {ctor: FileIO});

module.exports.load = load;

module.exports.File = File;
module.exports.DuplexFile = DuplexFile;
