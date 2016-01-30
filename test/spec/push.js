var husk = require('../..');

describe('husk:', function() {

  it('should pass through with no function', function(done) {
    husk({})
      .push()
      .run(done);
  });

  it('should push with sync callback', function(done) {
    husk()
      .push(function(){this.push({field: 'value'})})
      .assert(function() {
        return this.field === 'value';
      })
      .run(done);
  });

  it('should push with async callback', function(done) {
    husk()
      .push(function(chunk, cb){this.push({field: 'value'}); cb();})
      .assert(function() {
        return this.field === 'value';
      })
      .run(done);
  });

  it('should push with async encoding callback', function(done) {
    husk()
      .push(function(chunk, encoding, cb){this.push({field: 'value'}); cb();})
      .assert(function() {
        return this.field === 'value';
      })
      .run(done);
  });

});
