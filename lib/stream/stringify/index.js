var through = require('through3')
  , EOL = require('os').EOL;

/**
 *  Convert object mode data to json output.
 */
function Stringify(opts, method) {
  if(typeof opts === 'function') {
    method = opts;
    opts = null;
  }
  opts = opts || {};
  this.method = method;
  this.opts = opts;
  this.opts.indent = opts.indent !== undefined ? opts.indent : 0;
}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  var input = chunk, output;
  if(typeof this.method === 'function') {
    input = this.method.call(chunk, this);
  }
  console.dir(input.inspect)
  if(chunk !== undefined && !Buffer.isBuffer(chunk)) {
    // TODO: make this configurable
    if(typeof input.inspect === 'function') {
      input = input.inspect();
    }
    output = JSON.stringify(
      input, this.opts.replacer, this.opts.indent) + EOL;

    // decorate chunk
    if(this.opts.field) {
      chunk[this.opts.field] = output;
    // mutate downstream
    }else{
      chunk = output;
    }
  }
  this.push(chunk);
  cb();
}

module.exports = through.transform(transform, {ctor: Stringify});
