var util = require('util')
  , EOL = require('os').EOL
  , Transform = require('stream').Transform;

/**
 *  Convert arrays to objects.
 */
function ObjectPlugin(opts) {
  if(!(this instanceof ObjectPlugin)) {
    return new ObjectPlugin(opts);
  }
  this.opts = opts || {};
  this.opts.delimiter = this.opts.delimiter || ' ';
  this.opts.schema = this.opts.schema || {};
  Transform.call(this);
  this._writableState.objectMode = true;
  this._readableState.objectMode = true;
}

util.inherits(ObjectPlugin, Transform);

/**
 *  Transform function.
 */
function _transform(chunk, encoding, cb) {
  var opts = this.opts;
  if(Array.isArray(chunk)) {
    var o = {};
    chunk.forEach(function(row, index) {
      if(Array.isArray(row)) {
        var o = {}, rule;
        row.forEach(function(entry, ind) {
          var gobble = false;
          for(var k in opts.schema) {
            if(opts.schema[k] !== undefined){
              rule = opts.schema[k];
              if(!Array.isArray(rule)) {
                if(typeof rule === 'number' && rule < 0) {
                  rule = Math.abs(rule);
                  gobble = true;
                }
                rule = [rule];
              }
              if(~rule.indexOf(ind)) {
                if(gobble) {
                  //console.log(row);
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
        chunk[index] = o;
      }
    })
  }

  this.push(chunk);
  cb();
}

ObjectPlugin.prototype._transform = _transform;

//module.exports = ObjectPlugin;

module.exports = function plugin() {
  this.object = function object(opts) {
    return this.pipe(new ObjectPlugin(opts));
  }
}
