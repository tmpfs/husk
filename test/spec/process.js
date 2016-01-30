var expect = require('chai').expect
  , husk = require('../..')
  , process = require('husk-exec');

describe('husk:', function() {

  it('should not start if running', function(done) {
    var ps = process('pwd');

    // bind with null error so exit code does not
    // trigger mocha error
    ps.once('executed', done.bind(null, null));
    ps.start();
    // call again, should ignore
    ps.start();
  });

  it('should emit error event on ENOENT', function(done) {
    husk()
      .on('error', function onError(e) {
        function fn() {
          throw e;
        }
        expect(fn).throws(Error);
        expect(fn).throws(/ENOENT/);
        done();
      })
      .exec('non-existent-bin')
      .run();
  });

  it('should pass through chunks once started', function(done) {
    // test process stream passthrough
    husk([1,2,3])
      .each()
      .exec('pwd')
      .run(done);
  });

});
