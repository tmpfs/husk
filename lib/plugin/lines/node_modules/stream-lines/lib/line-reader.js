var util = require('util')
  , Transform = require('stream').Transform
  , LF = '\n'.charCodeAt(0);

/**
 *  Reads stream buffers and writes arrays of lines.
 *
 *  Designed to be piped to another transform stream that
 *  operates on the array of lines.
 *
 *  ## Options
 *
 *  @param encoding The encoding to use when converting buffers to strings.
 */
function LineReader(options) {
  if(!(this instanceof LineReader)) {
    return new LineReader(options);
  }
  Transform.call(this);
  this._writableState.objectMode = false;
  this._readableState.objectMode = true;
  options = options || {};
  this.encoding = options.encoding || 'utf8';
  this.eol = /\r?\n/;
}

util.inherits(LineReader, Transform);

/**
 *  Transform function.
 */
function _transform(chunk, encoding, cb) {
  var str, lines, i = chunk.length - 1, b;

  if(this.buffer && this.buffer.length) {
    chunk = Buffer.concat(
      [this.buffer, chunk], this.buffer.length + chunk.length);
  }

  // end with line feed, safe to split the lot
  if(chunk[chunk.length - 1] === LF) {
    str = chunk.toString(this.encoding);
  }else{
    // reverse search for line feed
    while((b = chunk[i]) !== undefined) {
      if(b === LF) {
        // get what we can split now
        str = chunk.toString(this.encoding, 0, i);
        // stash the remainder for the next transform or flush
        this.buffer = chunk.slice(i);
        break;
      }
      i--;
    }
  }

  // no newline found, possibly very long line
  if(!str) {
    this.buffer = !this.buffer
      ? chunk
      : Buffer.concat([this.buffer, chunk], this.buffer.length + chunk.length);
    return cb();
  }

  lines = str.split(this.eol);
  this.push(lines);
  this.emit('lines', lines);
  cb();
}

function _flush() {
  var lines;
  // unterminated last line, need to flush it
  if(this.buffer) {
    lines = [this.buffer.toString(this.encoding)];
    this.push(lines);
    this.emit('lines', lines);
  }
  this.buffer = null;
}

LineReader.prototype._transform = _transform;
LineReader.prototype._flush = _flush;

module.exports = LineReader;
