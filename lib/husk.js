var util = require('util')
  , events = require('events')
  , plug = require('zephyr');

/**
 *  System entry point.
 */
function Husk(data, opts) {
  if(!(this instanceof Husk)) {
    return new Husk(data, opts);
  }
  opts = opts || {};
  this.opts = opts;
  this.pipeline = [];
  this.data = data !== undefined ? data : new Buffer(0);
  this.opts.end = opts.end !== undefined ? opts.end : true;
}

util.inherits(Husk, events.EventEmitter);

// create plugin system
var main = plug({proto: Husk.prototype, type: Husk, field: 'plugin'})

// default core plugin load
main.plugin([require('husk-core')]);

// load optional fs plugin
main.fs = function fs(conf) {
  conf = conf || {alias: true};
  return main.plugin(
    [
      require('husk-async'),
      {plugin: require('husk-fs'), conf: conf}
    ]
  );
}

// load optional exec plugin
main.exec = function exec(conf) {
  conf = conf || {alias: true};
  return main.plugin(
    [
      {plugin: require('husk-exec'), conf: conf}
    ]
  );
}

module.exports = main;
