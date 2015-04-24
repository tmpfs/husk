// MD5 (LICENSE) = d9195d9c75e4988d17450bb9162162e7

var husk = require('../..')
  , fs = require('fs')
  , file = 'LICENSE'
  , md5 = 'd9195d9c75e4988d17450bb9162162e7';

describe('husk:', function() {

  before(function(done) {
    delete require.cache[require.resolve('husk-hash')];
    husk.plugin([
      require('husk-hash')
    ])
    done();
  })

  it('should pass through unsupported type', function(done) {
    var h = husk(false)
      .hash({algorithm: 'md5'})
      .run(done);
  });

  it('should generate checksum for file read stream', function(done) {
    var h = husk(file)
      .read({buffer: false})
      .hash({algorithm: 'md5', enc: 'hex'})
      .assert(function(){
        return this.valueOf() === md5;
      })
      .run(done);
  });

  it('should generate checksum for file buffer', function(done) {
    var h = husk(file)
      .read()
      .hash({algorithm: 'md5', enc: 'hex'})
      .assert(function(){
        return this.valueOf() === md5;
      })
      .run(done);
  });

  it('should generate checksum for buffer input', function(done) {
    var h = husk(fs.readFileSync(file))
      .read()
      .hash({algorithm: 'md5', enc: 'hex'})
      .assert(function(){
        return this.valueOf() === md5;
      })
      .run(done);
  });

  it('should generate checksum for string input', function(done) {
    var h = husk('' + fs.readFileSync(file))
      .hash({algorithm: 'md5', enc: 'hex'})
      .assert(function(){
        return this.valueOf() === md5;
      })
      .run(done);
  });

  it('should push buffer with default algorithm', function(done) {
    var h = husk('' + fs.readFileSync(file))
      .hash()
      .assert(function() {
        return Buffer.isBuffer(this);
      })
      .run(done);
  });

});
