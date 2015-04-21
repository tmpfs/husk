var expect = require('chai').expect
  , husk = require('../..');

describe('husk:', function() {

  it('should pass through with no function', function(done) {
    var h = husk({})
      .transform()
      .run(done);
  });

  it('should use transform function return value', function(done) {
    var h = husk({})
      .transform(function(){return {field: 'value'}})
      .assert(function() {
        return this.field === 'value';
      })
      .run(done);
  });

  it('should use named transform function return value', function(done) {
    var h = husk({})
      .transform(function transformer(){return {field: 'value'}})
      .assert(function() {
        return this.field === 'value';
      })
      .run(done);
  });
});
