var through = require('through3');

function Concat(opts) {
  opts = opts || {};
  var encoding = opts.encoding;
  if(encoding) {
    encoding = String(encoding).toLowerCase();
    if(encoding === 'u8' || encoding === 'uint8') {
      encoding = 'uint8array';
    }
  }
  this.encoding = encoding;
  this.body = [];
}

function transform(chunk, encoding, cb) {
  this.body.push(chunk)
  cb()
}

function flush(cb) {
  this.push(getBody(this.body, this.encoding));
  cb();
}

// PRIVATE UTILS

function infer(body) {
  var buf = body[0];
  if(Buffer.isBuffer(buf)) {
    return 'buffer';
  }else if(buf instanceof Uint8Array) {
    return 'uint8array';
  }else if(Array.isArray(buf)) {
    return 'array';
  }else if(typeof buf === 'string') {
    return 'string';
  }
  return 'buffer';
}

function getBody(body, encoding) {
  if(!body.length) {
    return [];
  }
  if(!encoding) {
    encoding = infer(body);
  }
  if(encoding === 'array') {
    return arrayConcat(body);
  }
  if(encoding === 'string') {
    return stringConcat(body);
  }
  if(encoding === 'buffer') {
    return bufferConcat(body);
  }
  if(encoding === 'uint8array') {
    return u8Concat(body);
  }
  return body;
}

function stringConcat(parts) {
  var strings = [], i, p;
  for(i = 0; i < parts.length; i++) {
    p = parts[i];
    if(typeof p === 'string') {
      strings.push(p)
    } else if(Buffer.isBuffer(p)) {
      strings.push(p)
    } else {
      strings.push(Buffer(p))
    }
  }
  return strings.join('');
}

function bufferConcat(parts) {
  var bufs = [], i, p, l = 0;
  for(i = 0; i < parts.length; i++) {
    p = parts[i]
    if(Buffer.isBuffer(p)) {
      bufs.push(p)
    } else if(typeof p === 'string') {
      bufs.push(Buffer(p))
    } else {
      bufs.push(Buffer(String(p)))
    }
    l += bufs[bufs.length - 1].length;
  }
  return Buffer.concat(bufs, l);
}

function arrayConcat(parts) {
  return Array.prototype.concat.apply([], parts);
}

function u8Concat(parts) {
  var len = 0, i, j, part, u8, offset = 0;
  for(i = 0; i < parts.length; i++) {
    if(typeof parts[i] === 'string') {
      parts[i] = Buffer(parts[i])
    }
    len += parts[i].length
  }
  u8 = new Uint8Array(len);
  for(i = 0; i < parts.length; i++) {
    part = parts[i];
    for(j = 0; j < part.length; j++) {
      u8[offset++] = part[j]
    }
  }
  return u8
}

module.exports = through.transform(transform, flush, {ctor: Concat});
