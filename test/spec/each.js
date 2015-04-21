var husk = require('../..');

describe('husk:', function() {

  it('should pass through bad chunk', function(done) {
    var h = husk('')
      .each()
      .run(done);
  });

  it('should iterate array', function(done) {
    var h = husk([1,2,3])
      .each()
      .assert(function() {
        return (this instanceof Number);
      })
      .run(done);
  });

  it('should pluck in iterator function', function(done) {
    var h = husk([{n:1},{n:2},{n:3}])
      .each(function() {
        return this.n;
      })
      .assert(function() {
        return (this instanceof Number);
      })
      .run(done);
  });

  it('should iterate string characters', function(done) {
    var h = husk('abc')
      .each()
      .assert(function() {
        return (this instanceof String);
      })
      .run(done);
  });

});
