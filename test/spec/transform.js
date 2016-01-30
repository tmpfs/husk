var husk = require('../..');

describe('husk:', function() {

  it('should pass through with no function', function(done) {
    husk({})
      .transform()
      .run(done);
  });

  it('should use transform function return value', function(done) {
    husk({})
      .transform(function(){return {field: 'value'}})
      .assert(function() {
        return this.field === 'value';
      })
      .run(done);
  });

  it('should use named transform function return value', function(done) {
    husk({})
      .transform(function transformer(){return {field: 'value'}})
      .assert(function() {
        return this.field === 'value';
      })
      .run(done);
  });
});
