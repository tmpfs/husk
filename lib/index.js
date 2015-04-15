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

// create plugin system
module.exports = plug({proto: Husk.prototype, type: Husk})
