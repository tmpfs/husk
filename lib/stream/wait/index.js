var through = require('through3')
  , newline = '\r\n';

/**
 *  Waits for data on the specified stream (output) and write to the
 *  stdin stream sending data (input) using the keypress event.
 *
 *  @param opts The wait options.
 *  @param method A method to invoke when the input has been written.
 *  @param stream The stream to wait for.
 */
function Wait(opts, method, stream) {
  this.output = null;
  if(typeof opts === 'function') {
    method = opts;
    opts = null;
  }
  if(typeof opts === 'string') {
    this.output = opts;
    opts = null;
  }
  opts = opts || {}
  this.opts = opts;
  this.output = opts.output ? opts.output : this.output;

  // timeout delay before dispatching keypress event
  this.opts.delay = typeof opts.delay === 'number' ? opts.delay : 10;

  // expected output prefix/suffix
  this.opts.suffix = opts.suffix !== undefined ? opts.suffix : ' ';
  this.opts.prefix = opts.prefix !== undefined ? opts.prefix : '';

  // default suffix for expected output (' ')
  if(this.output && this.opts.suffix) {
    this.output = this.opts.prefix + this.output + this.opts.suffix;
  }

  this.input = opts.input ? opts.input : newline;

  // ensure input to send is newline terminated so that
  // the readline module will emit a line event and the prompt
  // proceeds
  if(!/\r\n$/.test(this.input)) {
    this.input = this.input.replace(/\r?\n$/, '') + newline;
  }

  this.method = method;
  this.stream = opts.stream || process.stdout;
}

function postpone(chunk) {
  var method = this.method
    , input = this.input;
  function send() {
    process.stdin.emit('keypress', input);
    if(typeof method === 'function') {
      method.call(chunk);
    }
  }
  setTimeout(send, this.opts.delay)
}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  var scope = this
    , output = this.output
    , stream = this.stream
    , method = this.method;

  if((typeof output === 'string' || Buffer.isBuffer(output)) && stream.writable) {
    var writer = stream.write;
    stream.write = function(chunk, encoding, cb) {
      var input = chunk.toString(encoding)
        , expected = '' + output;
      writer.call(stream, chunk, encoding, cb);
      if(input === expected) {
        stream.write = writer;
        scope.postpone(chunk);
      }
    }
  }
  // pass through
  cb(null, chunk);
}

Wait.prototype.postpone = postpone;

module.exports = through.transform(transform, {ctor: Wait});
