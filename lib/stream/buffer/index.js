var util = require('util')
  , PassThrough = require('stream').PassThrough;

/**
 *  Buffers all data in a stream and emits on end.
 */
function BufferStream(cmd, args, opts, info) {
  if(!(this instanceof BufferStream)) {
    return new BufferStream(opts);
  }

  PassThrough.call(this);
  this.cork();
}

util.inherits(BufferStream, PassThrough);

module.exports = BufferStream;