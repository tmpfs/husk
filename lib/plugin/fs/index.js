var fs = require('fs');

/**
 *  Add a file read stream to the pipeline.
 */
function read() {
  return this.pipe(fs.createReadStream.apply(fs, arguments));
}

/**
 *  Add a file write stream to the pipeline.
 */
function write() {
  return this.pipe(fs.createWriteStream.apply(fs, arguments));
}

module.exports = function plugin() {
  this.read = read;
  this.write = write;
}
