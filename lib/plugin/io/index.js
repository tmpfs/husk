var url = require('url')
  , fsp = require('path');

/**
 *  Encapsulate a single file.
 */
function File(path, opts) {
  var body = null;

  // allows buffer / stream to set body with single arg
  if(typeof path !== 'string' && this.isContent(path)) {
    body = path;
    path = body.path || null;
  }

  // options may also be a string, buffer or stream body content
  if(this.isContent(opts)) {
    body = opts;
    opts = null;
  }

  opts = opts || {};
  if(opts.body) {
    body = opts.body;
  }
  this.opts = opts;

  this.stat = opts.stat || null;
  this.info = opts.info || null;
  this.fd = opts.fd || null;

  this.body = body;

  this._path = null;
  this._url = null;

  // use property!
  this.path = path;
}

/**
 *  Get of set the path for the file.
 */
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

/**
 *  Determine if this file appears to be a remote file, if a file://
 *  protocol is used this method will return true.
 */
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
function DuplexFile(source, target, sopts, topts) {
  this.source = new File(source, sopts);
  this.target = new File(target, topts);
}

function plugin() {
  // static class access
  var io = {
    File: File,
    DuplexFile: DuplexFile
  }

  // static creation
  io.file = function(path, opts) {
    return new File(path, opts);
  }

  io.duplex = function(source, target, sopts, topts) {
    return new DuplexFile(source, target, sopts, topts);
  }

  this.main.io = io;
}

module.exports = plugin;
