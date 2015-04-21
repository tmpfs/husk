var through = require('through3');

/**
 *  Convert arrays to objects.
 */
function ObjectStream(opts) {
  opts = opts || {};
  this.opts = opts;
  this.opts.delimiter = opts.delimiter !== undefined ? opts.delimiter : ' ';
  this.opts.schema = opts.schema || {};
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
  if(Array.isArray(chunk)) {
    chunk = getRowObject(chunk, this.opts);
  }

  this.push(chunk);
  cb();
}

module.exports = through.transform(transform, {ctor: ObjectStream});
