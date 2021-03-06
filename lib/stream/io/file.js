var url = require('url')
  , fsp = require('path');

/**
 *  Encapsulate a single file.
 */
function File(path, opts) {
  var body = null;

  // allows buffer / stream to set body with single arg
  if(this.isContent(path)) {
    body = path;
    path = body.path || null;
  }

  // options may also be a buffer or stream body content
  if(this.isContent(opts)) {
    body = opts;
    opts = null;
  }

  opts = opts || {};
  if(opts.body) {
    body = opts.body;
  }
  this.opts = opts;

  this.base = opts.base || process.cwd();
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
      this._url = url.parse(pth, true);

      // treat as local file system path info
      if(!this._url.protocol) {
        this._url = fsp.parse(pth);
      }
    }
  }
  return this._path;
}

// properties

Object.defineProperty(File.prototype, 'path', {
  get: path,
  set: path
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
  return Boolean(body && (Buffer.isBuffer(body) || this.isStream(body)));
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

/**
 *  Get or set the parent directory for a path.
 */
function dirname(dir) {
  var p = this._path || '';
  if(dir) {
    p = this.path = fsp.join(dir, fsp.basename(p));
  }
  return fsp.dirname(p);
}

/**
 *  Get or set the basename for a path.
 */
function basename(name) {
  var p = this._path || '';
  if(name) {
    p = this.path = fsp.join(fsp.dirname(p), name);
  }
  return fsp.basename(p);
}

/**
 *  Return an object suitable for stringify.
 */
function inspect() {
  return {
    base: this.base,
    path: this.path,
    url: this._url,
    name: this.basename()
  }
}

File.prototype.isContent = isContent;
File.prototype.isBuffer = isBuffer;
File.prototype.isStream = isStream;
File.prototype.isRemote = isRemote;
File.prototype.dirname = dirname;
File.prototype.basename = basename;
File.prototype.inspect = inspect;

/**
 *  Encapsulates a file with a source and destination.
 */
function DuplexFile(source, target, sopts, topts) {
  this.source = new File(source, sopts);
  this.target = new File(target, topts);
}

Object.defineProperty(DuplexFile.prototype, 'path', {
  get: function proxy(pth) {
    this.source.path = pth;
    this.target.path = pth;
    return this.source.path;
  }
})

DuplexFile.prototype.inspect = function() {
  return {
    source: this.source.inspect(),
    target: this.target.inspect()
  }
}

module.exports = {
  File: File,
  DuplexFile: DuplexFile
}
