var expect = require('chai').expect
  , husk = require('../..')
  , fs = require('husk-fs');

// trigger custom alias conf code path
fs({alias: fs.alias()});

describe('husk:', function() {

  it('should stat file', function(done) {
    var h = husk()
      .stat(__filename)
      .pluck(1)
      .assert(function() {
        return this.size && typeof this.size === 'number';
      })
      .run(done);
  });

  it('should stat file w/ function arg', function(done) {
    var h = husk()
      .stat(function(){return [__filename]})
      .pluck(1)
      .assert(function() {
        return this.size && typeof this.size === 'number';
      })
      .run(done);
  });

  it('should pass through unsupported type', function(done) {
    var h = husk({})
      .read()
      .assert(function() {
        expect(this).to.eql({});
        return true;
      })
      .run(done);
  });

  it('should read file w/ auto buffer', function(done) {
    var h = husk(__filename)
      .read()
      .assert(function() {
        return Buffer.isBuffer(this.body) && this.body.length > 0;
      })
      .run(done);
  });

  it('should read file w/ function arg', function(done) {
    var h = husk()
      .read(function(){return [__filename]})
      .assert(function() {
        return Buffer.isBuffer(this.body) && this.body.length > 0;
      })
      .run(done);
  });

  it('should see paused file stream (no buffer)', function(done) {
    var h = husk(__filename)
      .read({buffer: false})
      .pluck(1)
      .assert(function() {
        return this.body.readable;
      })
      .run(done);
  });

  it('should pass through on  write w/ unsupported type', function(done) {
    var h = husk([])
      .write()
      .assert(function() {
        expect(this).to.eql([]);
        return true;
      })
      .run(done);
  });

  it('should read and write file', function(done) {
    var h = husk('package.json')
      .read()
      .write()
      .assert(function() {
        return this.path === 'package.json';
      })
      .run(done);
  });

  it('should read and write file w/ function arg', function(done) {
    var h = husk('package.json')
      .read()
      .write(function(){return ['package.json.bak']})
      .assert(function() {
        return this.path === 'package.json';
      })
      .run(done);
  });

  it('should read and write file w/ stream pipe', function(done) {
    var h = husk('package.json')
      .read({buffer: false})
      .write(function(){return ['package.json.bak']})
      .assert(function() {
        return this.path === 'package.json' && this.dest === 'package.json.bak';
      })
      .unlink(function(){return [this.dest]})
      .run(done);
  });


  it('should passthrough on bad write data', function(done) {
    var h = husk(false)
      .write()
      .run(done);
  });

  it('should passthrough on bad contents object', function(done) {
    var h = husk({path: 'mock.bak', contents: {}})
      .write()
      .unlink(function(){return [this.path]})
      .run(done);
  });

});
