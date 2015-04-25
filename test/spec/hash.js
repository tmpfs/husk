var expect = require('chai').expect
  , husk = require('../..')
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

  it('should emit error on bad algorithm', function(done) {
    var h = husk(file)
      .on('error', function(e) {
        done();
      })
      .read({buffer: false})
      .hash({algorithm: ['unknown']})
      .run();
  });

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
        return this.md5.valueOf() === md5;
      })
      .run(done);
  });

  it('should generate checksum for file buffer', function(done) {
    var h = husk(file)
      .read()
      .hash({algorithm: 'md5', enc: 'hex'})
      .assert(function(){
        return this.md5.valueOf() === md5;
      })
      .run(done);
  });

  it('should generate checksum for buffer input', function(done) {
    var h = husk(fs.readFileSync(file))
      .read()
      .hash({algorithm: 'md5', enc: 'hex'})
      .assert(function(){
        return this.md5.valueOf() === md5;
      })
      .run(done);
  });

  it('should generate checksum for string input', function(done) {
    var h = husk('' + fs.readFileSync(file))
      .hash({algorithm: 'md5', enc: 'hex'})
      .assert(function(){
        return this.md5.valueOf() === md5;
      })
      .run(done);
  });

  it('should push buffer with default algorithm', function(done) {
    var h = husk('' + fs.readFileSync(file))
      .hash()
      .assert(function() {
        return Buffer.isBuffer(this.sha512);
      })
      .run(done);
  });

  it('should compute multiple checksums for multiple files', function(done) {
    var data = null;
    function complete() {
      expect(data).to.be.an('array');
      data.forEach(function(item) {
        expect(item.file).to.be.a('string');
        expect(item.hash).to.be.an('object');
        expect(item.hash.md5).to.be.a('string');
        expect(item.hash.sha1).to.be.a('string');
      })
      done();
    }

    husk()
      .find('lib/plugin/exec', '-name', '*.js')
      .lines({buffer: true})
      .each()
      .reject(function(){return this.valueOf() === ''})
      .read({buffer: false})
      .hash({
        algorithm: ['sha1', 'md5'],
        enc: 'hex',
        passthrough: true,
        field: 'hash'
      })
      .transform(function(){return {file: this.path, hash: this.hash}})
      .reject(function(){
        return this.file === undefined
          || !this.hash || this.hash.sha1 === undefined;
      })
      .concat()
      .through(function(){data = this})
      .run(complete);
  });

  it('should compute multiple checksums without field', function(done) {
    var data = null;
    function complete() {
      expect(data).to.be.an('array');
      data.forEach(function(item) {
        expect(item.md5).to.be.a('string');
        expect(item.sha1).to.be.a('string');
      })
      done();
    }

    husk()
      .find('lib/plugin/exec', '-name', '*.js')
      .lines({buffer: true})
      .each()
      .reject(function(){return this.valueOf() === ''})
      .read({buffer: false})
      .hash({
        algorithm: ['sha1', 'md5'],
        enc: 'hex',
        passthrough: true
      })
      .reject(function(){
        return this.sha1 === undefined;
      })
      .concat()
      .through(function(){data = this})
      .run(complete);
  });

});
