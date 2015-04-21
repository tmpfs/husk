var through = require('through3')
  , prompt = require('cli-input');

/**
 *  Calls a function which shows a prompt to collect data from stdin.
 *
 *  Functions are invoked in the scope of the stream and passed a reference
 *  to the prompt instance and the transform arguments:
 *
 *  function(ps, chunk, encoding, cb)
 *
 *  Invoked functions *must* call the callback optionally passing an error
 *  and chunk to push:
 *
 *  function(err, chunk)
 *
 *  @param opts The opts for the prompt module.
 *  @param method The function to invoke.
 */
function Prompt(opts, method) {
  if(typeof opts === 'function') {
    method = opts;
    opts = null;
  }
  this.opts = opts || {};
  this.method = method;
  this.ps = prompt(opts);
}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  // invoke the prompt method
  if(typeof this.method === 'function') {
    this.method.call(this, this.ps, chunk, encoding, cb);
  // pass through
  }else{
    this.push(chunk);
    cb();
  }
}

var Stream = through.transform(transform, {ctor: Prompt});


// static access to formatted prompt string data
Stream.getPrompt = function getPrompt(info, opts) {
  var ps = prompt(opts);
  return ps.format(info);
}

module.exports = Stream;
