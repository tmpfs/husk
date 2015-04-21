var through = require('through3');

/**
 *  Waits for data on the specified stream and proceeds when
 *  the expected data is written.
 *
 *  @param data The data to wait for (string or buffer).
 *  @param method A method to invoke when the expected data is written
 *  to the target stream.
 *  @param stream The stream to wait for.
 */
function Wait(opts, method, stream) {
  this.data = null;
  if(typeof opts === 'string') {
    this.data = opts;
    opts = null;
  }
  opts = opts || {}
  this.opts = opts;
  this.data = opts.data ? opts.data : this.data;
  // timeout delay before dispatching keypress event
  this.opts.delay = typeof opts.delay === 'number' ? opts.delay : 10;
  this.opts.append = opts.append !== undefined ? opts.append : ' ';
  if(this.data && this.opts.append) {
    this.data = '' + this.data + this.opts.append;
  }
  this.method = method;
  this.stream = stream || process.stdout;
}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  var data = this.data
    , stream = this.stream
    , method = this.method;

  if((typeof data === 'string' || Buffer.isBuffer(data)) && stream.writable) {
    var writer = stream.write;
    stream.write = function(chunk, encoding, cb) {
      var input = chunk.toString(encoding)
        , expected = '' + data;
      writer.call(stream, chunk, encoding, cb);
      if(input === expected) {
        stream.write = writer;
        if(typeof method === 'function') {
          method.call(chunk);
        }
      }
    }
  }

  // pass through
  cb(null, chunk);
}

module.exports = through.transform(transform, {ctor: Wait});
