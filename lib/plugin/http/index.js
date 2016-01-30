var HttpStream = require('http-flow');

function stream(opts) {
  return new HttpStream(opts);
}

function verb(nm, method) {
  var cmd = function proxy(opts) {
    opts = opts || {};
    opts.method = method;
    return this.request.apply(
      this, [opts].concat([].slice.call(arguments, 1)));
  }

  // assign to the prototype
  this[nm] = cmd;

  // return closure
  return cmd;
}

function alias() {
  return require('./alias');
}

function plugin(conf) {
  conf = conf || {};
  conf.alias = conf.alias !== undefined ? conf.alias : alias();

  this.request = function request(opts) {
    return this.fuse(stream(opts));
  }

  // static access, create your own http verb methods :)
  this.main.verb = verb.bind(this);

  // alias common http methods methods on the prototype
  if(conf.alias) {
    var aliases = typeof conf.alias === 'object' ? conf.alias : alias()
      , k;
    for(k in aliases) {
      this.main.verb(k, aliases[k]);
    }
  }
}

stream.alias = alias;
stream.plugin = plugin;
module.exports = stream;
