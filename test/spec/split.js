var expect = require('chai').expect
  , husk = require('../..');

describe('husk:', function() {

  before(function(done) {
    // ensure we override exec() split proxy
    delete require.cache[require.resolve('husk-split')];
    husk.plugin([require('husk-split')]);
    done();
  });

  it('should pass through with non string', function(done) {
    var h = husk({})
      .split()
      .run(done);
  });

  it('should split string into array', function(done) {
    var h = husk('1 2 3')
      .split()
      .assert(function() {
        expect(this).to.eql(['1','2','3']);
        return true;
      })
      .run(done);
  });

  it('should split string into array without trim', function(done) {
    var h = husk('1 2 3 ')
      .split({trim: false})
      .assert(function() {
        expect(this).to.eql(['1','2','3', '']);
        return true;
      })
      .run(done);
  });

});
