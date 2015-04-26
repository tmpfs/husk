var HttpStream = require('http-flow');

function stream(opts) {
  return new HttpStream(opts);
}

function verb(nm, fn) {
  var cmd = function proxy(opts) {
    opts = opts || {};
    opts.method = nm;
    return this.request.apply(
      this, [opts].concat([].slice.call(arguments, 1)));
  }

  // assign to the prototype
  this[fn || nm] = cmd;

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

  // static access, create your own shortcuts :)
  this.main.verb = verb = verb.bind(this);

  // alias common commands as methods on the prototype
  if(conf.alias) {
    var aliases = typeof conf.alias === 'object' ? conf.alias : alias()
      , k;
    for(k in aliases) {
      verb(k, aliases[k]);
    }
  }
}

stream.alias = alias;
stream.plugin = plugin;
module.exports = stream;
