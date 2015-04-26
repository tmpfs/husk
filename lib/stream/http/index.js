var through = require('through3')
  , http = require('http');

/**
 */
function Http(opts) {
  opts = opts || {};
  this.opts = opts;
}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  this.push(chunk);
  cb();
}

module.exports = through.transform(transform, {ctor: Http});
