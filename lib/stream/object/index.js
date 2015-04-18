var through = require('through3');

/**
 *  Convert arrays to objects.
 */
function ObjectStream(opts) {
  this.opts = opts || {};
  this.opts.delimiter = this.opts.delimiter || ' ';
  this.opts.schema = this.opts.schema || {};
}

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
function transform(chunk, encoding, cb) {
  var opts = this.opts;

  // this handles arrays of arrays and arrays of strings
  // should be separate plugins really

  if(Array.isArray(chunk)) {
    var o = {}, i, nested = false;
    // are we dealing with arrays of arrays
    // if we find one nested arra
    // TODO: remove this, users should use each()
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

module.exports = through.transform(transform, {ctor: ObjectStream});
