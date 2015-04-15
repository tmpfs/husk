var util = require('util')
  , PassThrough = require('stream').PassThrough
  , plug = require('zephyr');

/**
 *  System entry point.
 */
function Husk(opts) {
  if(!(this instanceof Husk)) {
    return new Husk(opts);
  }
  PassThrough.apply(this, arguments);
}

util.inherits(Husk, PassThrough);

// create plugin system
var main = plug({proto: Husk.prototype, type: Husk})
main.defaults = function defaults(conf) {
  conf = conf || {alias: true};
  main.plugin([
    require('husk-core'),
    {plugin: require('husk-exec'), conf: conf}
  ]);
  return main;
}

module.exports = main;
