var expect = require('chai').expect
  , husk = require('../..');

describe('husk:', function() {

  it('should pass through with no function', function(done) {
    var h = husk({})
      .through()
      .run(done);
  });

  it('should pass through function', function(done) {
    var h = husk({})
      .through(function(){this.field = 'value'})
      .assert(function() {
        return this.field === 'value';
      })
      .run(done);
  });

});
