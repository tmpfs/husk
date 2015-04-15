var util = require('util')
  , Stream = require('process-flow')
  , plug = require('zephyr');

/**
 *  System entry point.
 */
function Husk(opts) {
  if(!(this instanceof Husk)) {
    return new Husk(opts);
  }
  Stream.apply(this, arguments);
}

util.inherits(Husk, Stream);

/**
 *  Extract a callback function from an arguments array.
 */
function callback(args) {
  var cb
    , args = [].slice.call(args)
    , i = args.length -1;

  while(i > 0 && !cb) {
    if(typeof args[i] === 'function') {
      cb = args.pop();
      break;
    }
    i--;
  }
  return {cb: cb, args: args};
}

Husk.prototype.callback = callback;

// create plugin system
module.exports = plug({proto: Husk.prototype, type: Husk})
