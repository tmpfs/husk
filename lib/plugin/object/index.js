var util = require('util')
  , EOL = require('os').EOL
  , Transform = require('stream').Transform;

/**
 *  Convert arrays to objects.
 */
function ObjectStream(opts) {
  if(!(this instanceof ObjectStream)) {
    return new ObjectStream(opts);
  }
  this.opts = opts || {};
  this.opts.delimiter = this.opts.delimiter || ' ';
  this.opts.schema = this.opts.schema || {};
  Transform.call(this);
  this._writableState.objectMode = true;
  this._readableState.objectMode = true;
}

util.inherits(ObjectStream, Transform);

function getRowObject(row, opts) {
  var o = {}, rule;
  // iterate row strings
  row.forEach(function(entry, ind) {
    var gobble = false;
    // iterate schema fields
    for(var k in opts.schema) {
      if(opts.schema[k] !== undefined){
        rule = opts.schema[k];
        if(!Array.isArray(rule)) {
          // negative numbers indicate from that index
          // to the end of the row should be concatenated
          // using the delimiter option
          if(typeof rule === 'number' && rule < 0) {
            rule = Math.abs(rule);
            gobble = true;
          }
          rule = [rule];
        }
        if(~rule.indexOf(ind)) {
          if(gobble) {
            o[k] = '' + row.slice(ind).join(opts.delimiter);
          }else if(o[k] === undefined) {
            o[k] = '' + entry;
          }else{
            o[k] += (entry ? opts.delimiter + entry : entry);
          }
        }
      }
      gobble = false;
    }
  })
  return o;
}

/**
 *  Transform function.
 */
function _transform(chunk, encoding, cb) {
  var opts = this.opts;

  // this handles arrays of arrays and arrays of strings
  // should be separate plugins really

  if(Array.isArray(chunk)) {
    var o = {}, i, nested = false;
    // are we dealing with arrays of arrays
    // if we find one nested array
    for(i = 0;i < chunk.length;i++) {
      if(Array.isArray(chunk[i])) {
        nested = true;
        break;
      }
    }
    if(nested) {
      chunk.forEach(function(row, index) {
        if(Array.isArray(row)) {
          var o = getRowObject(row, opts);
          chunk[index] = o;
        }
      })
    }else{
      chunk = getRowObject(chunk, opts);
    }
  }

  this.push(chunk);
  cb();
}

ObjectStream.prototype._transform = _transform;

function stream(opts) {
  return new ObjectStream(opts);
}

function plugin() {
  this.object = function object(opts) {
    return this.fuse(stream(opts));
  }
}

stream.plugin = plugin;
module.exports = stream;
