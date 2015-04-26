var through = require('through3')
  , uri = require('url')
  , http = require('http')
  , request = http.request;

/**
 */
function Http(opts) {
  opts = opts || {};
  this.opts = opts;
  this.opts.method = opts.method || 'GET';
  //this.once('end', function(){console.log('http stream ended')})
}

/**
 *  Transform function.
 */
function transform(chunk, encoding, cb) {
  var k, opts = {}, req, url, scope = this;

  if(typeof chunk === 'string') {
    opts = uri.parse(chunk);
  }

  //console.dir('' + chunk);

  for(k in this.opts) {
    opts[k] = this.opts[k];
  }

  function onRequest(res) {
    res.socket.pipe(scope);
    scope.push(res);
    cb();
  }

  if(typeof chunk === 'string') {
    //console.log('making request')
    req = request(opts, onRequest);
    req.end();
  }else{
    this.push(chunk);
    cb();
  }
}

module.exports = through.transform(transform, {ctor: Http});
