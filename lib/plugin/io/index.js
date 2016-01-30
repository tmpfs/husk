var FileStream = require('io-flow')
  , File = FileStream.File
  , DuplexFile = FileStream.DuplexFile;

function stream(source, target, sopts, topts) {
  return new FileStream(source, target, sopts, topts);
}

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

stream.plugin = plugin;
module.exports = stream;
