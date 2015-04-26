var url = require('url');

/**
 *  Encapsulate a single file.
 */
function File(path, opts) {
  opts = opts || {};
  this.opts = opts;

  this.stat = null;
  this.info = null;
  this.fd = null;
  this.body = null;

  this._path = null;
  this._url = null;

  // use property!
  this.path = path;
}

function path(pth) {
  if(pth !== undefined) {
    this._path = null;
    this._url = null;
    if(typeof pth === 'number') {
      this.fd = parseInt(pth);
    }else if(typeof pth === 'string') {
      this._path = pth;
      this._url = url.parse(this._path, true);
    }
  }
  return this._path;
}

// properties

Object.defineProperty(File.prototype, 'path', {
  get: path,
  set: path,
})

Object.defineProperty(File.prototype, 'url', {
  get: function url() {
    return this._url;
  }
})

// methods

/**
 *  Determine if an object is suitable for setting as the
 *  body for a file.
 */
function isContent(body) {
  body = body || this.body;
  return Boolean(body && typeof body === 'string'
    || Buffer.isBuffer(body) || this.isStream(body));
}

/**
 *  Determine if an object or the file body is a buffer.
 */
function isBuffer(body) {
  body = body || this.body;
  return Buffer.isBuffer(body);
}

/**
 *  Loose test whether an object or the file body appears to be a stream.
 */
function isStream(body) {
  body = body || this.body;
  return Boolean(body
    && ((body.readable && typeof body.push === 'function')
      || (body.writable && typeof body.write === 'function')));
}

function isRemote() {
  return Boolean(this._url && this._url.protocol);
}

File.prototype.isContent = isContent;
File.prototype.isBuffer = isBuffer;
File.prototype.isStream = isStream;
File.prototype.isRemote = isRemote;

/**
 *  Encapsulates a file with a source and destination.
 */
function DuplexFile(source, target) {
  this.source = new File(source)
  this.target = new File(target);
}

function plugin() {
  // static class access
  var io = {
    File: File,
    DuplexFile: DuplexFile
  }
  this.main.io = io;
}

module.exports = plugin;
