var through = require('through3')
  , parser = require('cli-argparse');

/**
 *  Calls an arguments parser that conforms to the signature:
 *
 *  function([argv, opts])
 *
 *  The return value is pushed on to the stream. If the stream chunk is an
 *  array it is used as the input arguments for the parser otherwise
 *  process.argv is used.
 *
 *  @param opts Options for the argument parser.
 */
function Argv(opts) {
  this.opts = opts;
}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  var argv = process.argv.slice(2);
  if(Array.isArray(chunk)) {
    argv = chunk;
  }
  chunk = parser(argv, this.opts);
  this.push(chunk);
  cb();
}

module.exports = through.transform(transform, {ctor: Argv});
