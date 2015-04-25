var through = require('through3')
  , uri = require('url');

/**
 *  Format and parse uniform resource locators.
 */
function URL(opts) {
  opts = opts || {};
  this.opts = opts;
  this.opts.qs = typeof opts.qs === 'boolean' ? opts.qs : true;
}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  var res
    , opts = this.opts;

  if(typeof chunk === 'string') {
    res = uri.parse(chunk, opts.qs, opts.slashes);
  }else if(chunk && typeof chunk === 'object') {
    res = uri.format(chunk);
  }
  if(res && opts.field && chunk) {
    chunk[opts.field] = res;
  }
  if(opts.passthrough || opts.field) {
    this.push(chunk);
  }
  if(res && !opts.field) {
    this.push(res);
  }
  cb();
}

module.exports = through.transform(transform, {ctor: URL});
