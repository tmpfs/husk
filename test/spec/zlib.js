var expect = require('chai').expect
  , husk = require('../..');

describe('husk:', function() {

  it('should emit error on bad type', function(done) {
    husk()
      .on('error', function(e) {
        function fn() {
          throw e;
        }
        expect(fn).throws(Error);
        expect(fn).throws(/valid method type/);
        done();
      })
      .zlib()
      .run();
  });

  it('should compress string type', function(done) {
    var input = 'foo'
      , result;
    function complete() {
      expect(Buffer.isBuffer(result)).to.eql(true);
      done();
    }
    husk(input)
      .zlib({type: 'gzip'})
      .through(function(){result = this})
      .run(complete);
  });

  it('should compress buffer type', function(done) {
    var input = new Buffer('foo')
      , result;
    function complete() {
      expect(Buffer.isBuffer(result)).to.eql(true);
      done();
    }
    husk(input)
      .zlib({type: 'gzip'})
      .through(function(){result = this})
      .run(complete);
  });

});
