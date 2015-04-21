var through = require('through3')
  , newline = '\r\n';

/**
 *  Waits for data on the specified stream (output) and writes to the
 *  stdin stream sending data (input) using the keypress event or by calling
 *  write() if the keypress option is disabled.
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

  // emit keypress by default, if disabled, write to stream
  this.opts.keypress = typeof opts.keypress === 'boolean'
    ? opts.keypress : true;

  // ensure input to be written is newline delimited
  this.opts.nl = typeof opts.nl === 'boolean' ? opts.nl : true;


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
  if(this.opts.nl && !/\r\n$/.test(this.input)) {
    this.input = this.input.replace(/\r?\n$/, '') + newline;
  }

  this.method = method;
  this.writer = opts.writer || process.stdout;
  this.reader = opts.reader || process.stdin;
}

function postpone(chunk) {
  var method = this.method
    , input = this.input
    , reader = this.reader
    , keypress = this.opts.keypress;

  function send() {
    if(keypress) {
      reader.emit('keypress', input);
    }else{
      reader.write(input);
    }
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
    , stream = this.writer
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
