var through = require('through3')
  , url = require('url');

/**
 *  Format and parse uniform resource locators.
 */
function Url(opts) {
  this.opts = opts;
}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  this.push(chunk);
  cb();
}

module.exports = through.transform(transform, {ctor: Url});
