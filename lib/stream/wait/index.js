var through = require('through3')
  , newline = '\r\n';

/**
 *  Waits for data on the specified stream (output) and writes to the
 *  stdin stream sending data (input) using the keypress event or by calling
 *  write() if the keypress option is disabled.
 *
 *  @param opts The wait options.
 *  @param method A method to invoke when the input has been written.
 */
function Wait(opts, method) {
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

  // emit keypress by default, if disabled, write to stream
  this.opts.keypress = typeof opts.keypress === 'boolean'
    ? opts.keypress : true;

  // ensure input to be written is newline delimited
  this.opts.nl = typeof opts.nl === 'boolean' ? opts.nl : true;

  // block stream until expected data is written
  this.opts.block = typeof opts.block === 'boolean' ? opts.block : false;


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

function postpone(chunk, encoding, cb) {
  var method = this.method
    , input = this.input
    , reader = this.reader
    , keypress = this.opts.keypress
    , block = this.opts.block;

  process.nextTick(function writer() {
    if(keypress) {
      reader.emit('keypress', input);
    }else{
      reader.push(input);
    }
    if(typeof method === 'function') {
      method.call(chunk);
    }
    if(block) {
      cb();
    }
  });
}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  var scope = this
    , output = this.output
    , stream = this.writer
    , method = this.method;

  if((typeof output === 'string' || Buffer.isBuffer(output))
    && stream.writable) {

    var writer = stream.write;
    stream.write = function(buf, enc, next) {
      var input = buf.toString(enc)
        , expected = output.toString(enc);

      writer.call(stream, buf, enc, next);

      if(input === expected) {
        stream.write = writer;
        postpone.call(scope, chunk, encoding, cb);
      }
    }
  }
  if(!this.opts.block) {
    // pass through
    cb(null, chunk);
  }
}

module.exports = through.transform(transform, {ctor: Wait});
