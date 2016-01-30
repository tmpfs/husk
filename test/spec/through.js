var expect = require('chai').expect
  , husk = require('../..');

describe('husk:', function() {

  it('should pass through with no function', function(done) {
    husk({})
      .through()
      .run(done);
  });

  it('should pass through function', function(done) {
    husk({})
      .through(function(){this.field = 'value'})
      .assert(function() {
        expect(this.field).to.eql('value');
        return this.field === 'value';
      })
      .run(done);
  });

});
