var expect = require('chai').expect
  , husk = require('../..');

describe('husk:', function() {

  it('should pass through on no function', function(done) {
    var h = husk(__filename)
      .async()
      .run(done);
  });

  it('should call async function', function(done) {
    function fn(cb) {
      expect(this.valueOf()).to.eql(__filename);
      cb();
    }
    var h = husk(__filename)
      .async(fn)
      .run(done);
  });

  it('should call async function with args', function(done) {
    function fn(dir, cb) {
      expect(this.valueOf()).to.eql(__filename);
      expect(dir).to.eql(__dirname);
      cb();
    }
    var h = husk(__filename)
      .async(fn, [__dirname])
      .run(done);
  });

  it('should call async function with args and options', function(done) {
    function fn(dir, cb) {
      expect(this.valueOf()).to.eql(__filename);
      expect(dir).to.eql(__dirname);
      cb();
    }
    var h = husk(__filename)
      .async(fn, [__dirname], {result: false})
      .run(done);
  });

  it('should call anonymous function', function(done) {
    var h = husk(__filename)
      .async(function(cb) {
        cb();
      })
      .run(done);
  });

  it('should call anonymous function w/id', function(done) {
    var fn = function(cb) {
      cb();
    }
    fn.id = 'fn';

    var h = husk(__filename)
      .async(fn)
      .run(done);
  });

  it('should emit error on callback with error', function(done) {
    function fn(cb) {
      cb(new Error('mock cb err'));
    }
    var h = husk(__filename)
      .on('error', function(e) {
        function f() {
          throw e;
        }
        expect(f).throws(Error);
        expect(f).throws(/mock cb err/);
        done();
      })
      .async(fn)
      .run();
  });

});
