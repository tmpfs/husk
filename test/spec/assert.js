var expect = require('chai').expect
  , husk = require('../..')
  , assert = require('husk-assert');

describe('husk:', function() {

  it('should assert on chunk', function(done) {
    var h = husk(__filename)
      .assert(function(){
        return (this instanceof String) && (typeof this.valueOf() === 'string')
      })
      .run(done);
  });

  it('should pass through on no function', function(done) {
    var h = husk(__filename)
      .assert()
      .run(done);
  });


  it('should emit error on throw', function(done) {
    var h = husk(__filename)
      .on('error', function(e) {
        function fn() {
          throw e;
        }
        expect(fn).throws(Error);
        done();
      })
      .assert(function(){throw new Error('assertion failure')})
      .run();
  });

  it('should emit error and exit process on integer', function(done) {
    var exit = process.exit;
    process.exit = function() {
      process.exit = exit;
      done();
    }
    var h = husk(__filename)
      .on('error', function(e) {
        expect(e.code).to.eql(255);
        function fn() {
          throw e;
        }
        expect(fn).throws(Error);
      })
      .assert(function(){return this.valueOf() === __dirname || 512})
      .run();
  });

  it('should emit error from string message', function(done) {
    var h = husk(__filename)
      .on('error', function(e) {
        function fn() {
          throw e;
        }
        expect(fn).throws(Error);
        expect(fn).throws(/expected dirname/);
        done();
      })
      .assert(function(){
        return this.valueOf() === __dirname || 'expected dirname'
      })
      .run();
  });

});
