var service = require('./server')
  , server;

before(function(done) {
  server = service(done);
})

after(function(done) {
  server.close(done);
})
