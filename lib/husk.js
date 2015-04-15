var util = require('util')
  , ProcessStream = require('process-flow')
  , plug = require('zephyr');

/**
 *  System entry point.
 */
function Husk(opts) {
  if(!(this instanceof Husk)) {
    return new Husk(opts);
  }
  ProcessStream.apply(this, arguments);
}

util.inherits(Husk, ProcessStream);

// create plugin system
var main = plug({proto: Husk.prototype, type: Husk})
main.defaults = function defaults() {
  main.plugin([
    require('husk-core'),
    require('husk-exec')
  ]);
  return main;
}
module.exports = main;
