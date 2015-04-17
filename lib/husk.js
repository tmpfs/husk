var util = require('util')
  , plug = require('zephyr');

/**
 *  System entry point.
 */
function Husk(opts) {
  if(!(this instanceof Husk)) {
    return new Husk(opts);
  }
  this.pipeline = [];
}

// create plugin system
var main = plug({proto: Husk.prototype, type: Husk})

main.core = function core() {
  return main.plugin([require('husk-core')]);
  return main;
}

main.exec = function exec(conf) {
  conf = conf || {alias: true};
  return main.plugin([{plugin: require('husk-exec'), conf: conf}]);
}

module.exports = main;
