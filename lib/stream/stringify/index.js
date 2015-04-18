var through = require('through3')
  , EOL = require('os').EOL;

/**
 *  Convert object mode data to json output.
 */
function Stringify(opts) {
  opts = opts || {};
  this.opts = opts;
  this.opts.indent = opts.indent !== undefined ? opts.indent : 0;
}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  if(chunk !== undefined && !Buffer.isBuffer(chunk)) {
    chunk = JSON.stringify(
      chunk, this.opts.replacer, this.opts.indent) + EOL;
    this.push(chunk);
  }
  cb();
}

module.exports = through.transform(transform, {ctor: Stringify});
