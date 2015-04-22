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

  it('should see paused file stream (no buffer)', function(done) {
    var h = husk(__filename)
      .read({buffer: false})
      .pluck(1)
      .assert(function() {
        return this.body.readable;
      })
      .run(done);
  });

});
