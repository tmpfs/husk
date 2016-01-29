var service = require('./server')
  , server
  , husk = require('..')
  , fs = require('fs');

// load all plugins
var dirs = fs.readdirSync('./node_modules');
dirs.forEach(function(dir) {
  if(/^husk-/.test(dir)) {
    husk.plugin([require(dir)]);
  }
})


before(function(done) {
  server = service(done);
})

after(function(done) {
  server.close(done);
})
