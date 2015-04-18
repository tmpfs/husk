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
function streamable(type, ctor) {
  function Stream() {
    type.apply(this, arguments);
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
  opts = opts
  var type = Transform
    , type = streamable(type);
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

function duplexify(stream, reader, opts) {
  opts = opts || {};
  var type = streamable(Duplex, opts.ctor);
  type.prototype._write = PassThrough.prototype.write;
  type.prototype._read = PassThrough.prototype.read;
  if(stream) {
    var write = stream.prototype ? stream.prototype._write : stream._write.bind(stream);
    var read = stream.prototype ? stream.prototype._read : stream._read.bind(stream);
    if(!reader) {
      type.prototype._write = write;
    }else{
      type.prototype._read = read;
    }
  }
  return type;
}

/**
 *  Creates a pass through stream that calls cork to buffer all
 *  input and write on end.
 *
 *  Useful when you need all the data before operations can begin.
 */
function cork() {
  return through({ctor: function(){this.cork()}});
}

/**
 *  Get a corked stream instance.
 *
 *  Later this may be modified to support earlier versions
 *  of node that do not support cork().
 */
function buffer() {
  return new (cork());
}

/**
 *  Get a pass through stream instance.
 */
function passthrough() {
  return new (through());
}

var stdout = new (duplexify(process.stdout));
var stderr = new (duplexify(process.stderr));

//var pass = new (through());
//pass.pipe(process.stdout);
//pass.write('pass through data with write()\n');

//var buffer = new (cork());
//buffer.pipe(process.stdout);
//buffer.end('buffer (cork) data with end()\n');

//var reader = new (through(function read(){}));
//reader.pipe(process.stdout);
//reader.push('readable data push()\n');

//var sink = new (through(null, function write(){}));
//sink.once('finish', function(chunk) {
  //console.log('writable sink finish event end()');
//})
//sink.end();

//var duplex = new (through(function read(){}, function write(){}));
//duplex.pipe(process.stdout);
//duplex.push('duplex data with push()\n');

// wrap a writable class as a duplex stream class
//var writer = through(null, function write(chunk, encoding, cb){
  //console.log('wrapped write() called %j', '' + chunk);
  //cb();
//});
//var dup = new (duplexify(writer));
// pipe to self to trigger writable end
//dup.pipe(dup).pipe(process.stdout);
//dup.push('duplexify data with push()');
//

//var reader = new (through(function read(size){this.push(null)}));
//var transformer = new (transform(function transform(chunk, encoding, cb) {
  //this.push('transformed: ' + chunk);
  //cb();
//}, function flush(cb) {
  //console.log('transform flush called');
  //cb();
//}));
//transformer.pipe(stdout);
//transformer.write('transformer data write()\n');
//transformer.end('transformer data end()\n');

module.exports = through;
