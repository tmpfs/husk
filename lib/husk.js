var util = require('util')
  , events = require('events')
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

util.inherits(Husk, events.EventEmitter);

// create plugin system
var main = plug({proto: Husk.prototype, type: Husk, field: 'plugin'})

// default core plugin loaded
main.plugin([require('husk-core')]);

// TODO: remove this method
main.core = function core() {
  return main;
}

main.fs = function fs(conf) {
  conf = conf || {alias: true};
  return main.plugin(
    [
      require('husk-async'),
      {plugin: require('husk-fs'), conf: conf}
    ]
  );
}

main.exec = function exec(conf) {
  conf = conf || {alias: true};
  return main.plugin([{plugin: require('husk-exec'), conf: conf}]);
}

module.exports = main;
