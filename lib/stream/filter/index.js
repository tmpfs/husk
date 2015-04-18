var through = require('through3');

/**
 *  Calls a function with each chunk of data to be transformed, if the
 *  function returns truthy it is pushed.
 *
 *  @param method The function to invoke.
 */
function FilterStream(method) {
  this.truthy = true;
  this.method = method;
}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  if(typeof this.method === 'function') {
    var res = Boolean(this.method.call(chunk, chunk, this));
    if(this.truthy && res) {
      this.push(chunk);
    // reject style filter
    }else if(!this.truthy && !res) {
      this.push(chunk);
    }
  // pass through on bad method arg
  }else{
    this.push(chunk);
  }
  cb();
}

module.exports = through.transform(transform, {ctor: FilterStream});
