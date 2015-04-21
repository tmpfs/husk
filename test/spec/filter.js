var husk = require('../..');

describe('husk:', function() {

  it('should pass through on no function', function(done) {
    var h = husk()
      .filter()
      .run(done);
  });

  it('should filter array values', function(done) {
    var h = husk([1,2,3])
      .each()
      .filter(function(){
        return this.valueOf() === 1
      })
      .assert(function() {
        return (this.valueOf() === 1);
      })
      .run(done);
  });

  it('should reject array values', function(done) {
    var h = husk([1,2,3])
      .each()
      .reject(function(){
        return this.valueOf() !== 1
      })
      .assert(function() {
        return (this.valueOf() === 1);
      })
      .run(done);
  });

});
