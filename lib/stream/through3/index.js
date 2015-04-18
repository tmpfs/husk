var util = require('util')
  , stream = require('stream')
  , Readable = stream.Readable
  , Writable = stream.Writable
  , PassThrough = stream.PassThrough
  , Duplex = stream.Duplex
  , Transform = stream.Transform;

/**
 *  Creates a stream subclass.
 */
function streamable(type, ctor, opts) {
  function Stream() {
    arguments[0] = arguments[0] || opts || {objectMode: true};
    type.apply(this, arguments);

    var opts = arguments[0];

    if(opts.objectMode && this._writableState) {
      this._writableState.objectMode = true;
    }
    if(opts.objectMode && this._readableState) {
      this._readableState.objectMode = true;
    }

    //console.log('new stream %s', type.name);
    if(typeof ctor === 'function') {
      ctor.apply(this, arguments);
    }
  }
  util.inherits(Stream, type);
  return Stream;
}

/**
 *  Creates a transform stream subclass.
 */
function transform(fn, flush, opts) {
  opts = opts || {};
  opts.objectMode = opts.objectMode !== undefined
    ? opts.objectMode : true;
  var type = Transform
    , type = streamable(type, opts.ctor, opts);
  if(typeof fn === 'function') {
    type.prototype._transform = fn;
  }
  if(typeof flush === 'function') {
    type.prototype._flush = flush;
  }
  return type;
}

/**
 *  Creates a passthrough, read, write or duplex stream subclass.
 */
function through(read, write, opts) {
  var i = arguments.length - 1, type, proto;
  for(;i > 0;i--) {
    if(typeof arguments[i] === 'object') {
      opts = arguments[i];
      break;
    }
  }
  opts = opts || {};
  opts.objectMode = opts.objectMode !== undefined
    ? opts.objectMode : true;

  var readable = typeof read === 'function' ? read : null;
  var writable = typeof write === 'function' ? write : null;

  if(!readable && !writable) {
    type = streamable(PassThrough, opts.ctor);
  }else if(readable && !writable) {
    type = streamable(Readable, opts.ctor);
    type.prototype._read = readable;
  }else if(!readable && writable) {
    type = streamable(Writable, opts.ctor);
    type.prototype._write = writable;
  }else if(readable && writable) {
    type = streamable(Duplex, opts.ctor);
    type.prototype._read = readable;
    type.prototype._write = writable;
  }

  return type;
}

/**
 *  Creates a pass through stream subclass that calls cork to buffer all
 *  input and write on end.
 *
 *  Useful when you need all the data before operations can begin.
 */
function cork() {
  return through({ctor: function(){this.cork()}});
}

/**
 *  Get a pass through stream class.
 */
function passthrough(opts) {
  return through(opts);
}

through.extend = streamable;
through.transform = transform;
through.cork = cork;
through.passthrough = passthrough;

module.exports = through;
