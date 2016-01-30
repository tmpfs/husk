var FileStream = require('io-flow')
  , File = FileStream.File
  , DuplexFile = FileStream.DuplexFile;

function plugin() {

  // static class access
  var io = {
    File: File,
    DuplexFile: DuplexFile
  }

  // static creation
  io.file = function(path, opts) {
    return new File(path, opts);
  }

  io.duplex = function(source, target, sopts, topts) {
    return new DuplexFile(source, target, sopts, topts);
  }

  this.load = function(opts) {
    return this.fuse(FileStream.load(opts));
  }

  this.main.io = io;
}

module.exports = {
  plugin: plugin
}
