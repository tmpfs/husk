var http = require('http')
  , port = parseInt(process.env.TEST_PORT) || 3000
  , server = http.createServer(request);

/**
 *  Simple echo server for test specs.
 */
function request(req, res) {
  var buf = new Buffer(0);

  req.on('data', function(chunk) {
    buf = Buffer.concat([buf, chunk]);
  })

  req.on('end', function() {
    var msg = {
        headers: req.headers,
        method: req.method,
        url: req.url,
        length: buf.length
      }
      , body = JSON.stringify(msg, undefined, 2)

    res.writeHead(200, {
      'content-type': 'application/json',
      'content-length': Buffer.byteLength(body)});
    res.end(body);
  });
}

function start(cb) {
  server.listen(port, cb);
  return server;
}

if(!module.parent) {
  start();
}

module.exports = start;
