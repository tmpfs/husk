var util = require('util')
  , plug = require('zephyr');

/**
 *  System entry point.
 */
function Husk(data, opts) {
  if(!(this instanceof Husk)) {
    return new Husk(opts);
  }
  this.pipeline = [];
  opts = opts || {};
  this.opts = opts;
  this.data = data;
  this.opts.end = opts.end !== undefined ? opts.end : true;
}

// create plugin system
var main = plug({proto: Husk.prototype, type: Husk, field: 'plugin'})

main.core = function core() {
  return main.plugin([require('husk-core')]);
}

main.exec = function exec(conf) {
  conf = conf || {alias: true};
  return main.plugin([{plugin: require('husk-exec'), conf: conf}]);
}

module.exports = main;
