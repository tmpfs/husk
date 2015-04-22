var through = require('through3');

/**
 *  Concatenate chunks.
 *
 *  Supported encodings:
 *
 *  - string
 *  - buffer
 *  - array
 *  - u8|uint8|uint8array
 *
 *  @param opts Concatenate options.
 *  @param opts.enc A specific encoding, otherwise inferred.
 */
function Concat(opts) {
  opts = opts || {};
  var enc = opts.enc;
  if(enc) {
    enc = String(enc).toLowerCase();
    if(enc === 'u8' || enc === 'uint8') {
      enc = 'uint8array';
    }
  }
  this.enc = enc;
  this.body = [];
}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  this.body.push(chunk);
  cb();
}

/**
 *  Flush function.
 */
function flush(cb) {
  this.push(getBody(this.body, this.enc));
  cb();
}

// PRIVATE

/**
 *  Infer encoding from first chunk when no
 *  encoding is specified.
 */
function infer(body) {
  var buf = body[0];
  if(Buffer.isBuffer(buf)) {
    return 'buffer';
  }else if(buf instanceof Uint8Array) {
    return 'uint8array';
  }else if(Array.isArray(buf)) {
    return 'array';
  }else if(typeof buf === 'string' || (buf instanceof String)) {
    return 'string';
  }

  // pass through untouched, could not infer
  return null;
}

function getBody(body, encoding) {
  if(!body.length) {
    return [];
  }
  if(!encoding) {
    encoding = infer(body);
  }

  if(encoding === 'array') {
    body = arr(body);
  }else if(encoding === 'string') {
    body = str(body);
  }else if(encoding === 'buffer') {
    body = buf(body);
  }else if(encoding === 'uint8array') {
    body = u8(body);
  }

  return body;
}

/**
 *  Concatenate to string type.
 */
function str(parts) {
  var strings = [], i, p;
  for(i = 0; i < parts.length; i++) {
    p = parts[i];
    if(typeof p === 'string' || (p instanceof String)) {
      strings.push(p)
    }else if(Buffer.isBuffer(p)) {
      strings.push(p)
    }else{
      strings.push('' + p)
    }
  }
  return strings.join('');
}

/**
 *  Concatenate to Buffer type.
 */
function buf(parts) {
  var bufs = [], i, p, l = 0;
  for(i = 0; i < parts.length; i++) {
    p = parts[i]
    if(Buffer.isBuffer(p)) {
      bufs.push(p)
    }else if(typeof p === 'string') {
      bufs.push(Buffer(p))
    }else{
      bufs.push(Buffer(String(p)))
    }
    l += bufs[bufs.length - 1].length;
  }
  return Buffer.concat(bufs, l);
}

/**
 *  Concatenate to Array type.
 */
function arr(parts) {
  return Array.prototype.concat.apply([], parts);
}

/**
 *  Concatenate to Uint8Array type.
 */
function u8(parts) {
  var len = 0, i, j, part, arr, offset = 0;
  for(i = 0; i < parts.length; i++) {
    len += parts[i].length;
  }
  arr = new Uint8Array(len);
  for(i = 0; i < parts.length; i++) {
    part = parts[i];
    for(j = 0; j < part.length; j++) {
      arr[offset++] = part[j];
    }
  }
  return arr;
}

module.exports = through.transform(transform, flush, {ctor: Concat});
