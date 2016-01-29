var expect = require('chai').expect
  , husk = require('../..')
  , fs = require('fs')
  , zlib = husk.zlib;

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

  it('should pass through on unsupported type', function(done) {
    var input = []
      , result;
    function complete() {
      expect(result).to.eql(input);
      done();
    }
    husk(input)
      .zlib({type: 'gzip'})
      .through(function(){result = this})
      .run(complete);
  });

  it('should use static stream function', function(done) {
    var input = 'foo'
      , result;
    function complete() {
      expect(Buffer.isBuffer(result)).to.eql(true);
      done();
    }
    husk(input)
      .zlib(zlib.gzip())
      .through(function(){
        result = this;
      })
      .run(complete);
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

  it('should compress readable stream type', function(done) {
    var input = fs.createReadStream('package.json')
      , result;

    function complete() {
      expect(result.writable).to.eql(true);
      done();
    }

    husk()
      .zlib({type: 'gzip'})
      .through(function(){result = this})
      // NOTE: if a readable stream is passed to husk() it is piped
      // NOTE: to first in pipeline, by overriding data in run() we
      // NOTE: can transform on the stream
      .run({data: input}, complete);
  });

  it('should compress file object stream', function(done) {
    var result;

    function complete() {

      //expect(result.contents.writable).to.eql(true);
      done();
    }

    husk('package.json')
      .read({buffer: false})
      .zlib({type: 'gzip'})
      .through(function(){result = this})
      .run(complete);
  });

});
