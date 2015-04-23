var expect = require('chai').expect
  , husk = require('../..')
  , PluckStream = require('pluck-flow');

describe('husk:', function() {

  it('should use empty array on bad args', function(done) {
    var s = new PluckStream({});
    expect(s.fields).to.eql([]);
    done();
  });

  it('should pass through with no fields', function(done) {
    var h = husk({})
      .pluck()
      .run(done);
  });

  it('should ignore unsupported pluck field type', function(done) {
    var h = husk([{field: 'value'}])
      .pluck({})
      .run(done);
  });

  it('should pluck value', function(done) {
    var h = husk([{field: 'value'}])
      .pluck(0, function(){return this.field})
      .assert(function() {
        return this.valueOf() === 'value';
      })
      .run(done);
  });

  it('should ignore missing property', function(done) {
    var h = husk([{field: 'value'}])
      .pluck(1, function(){return this.field})
      .assert(function() {
        // undefined is coerced to global
        return this === global;
      })
      .run(done);
  });

});
