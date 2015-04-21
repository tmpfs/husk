var expect = require('chai').expect
  , husk = require('../..');

describe('husk:', function() {

  it('should pass through non-array', function(done) {
    var h = husk('')
      .object({schema: {}})
      .run(done);
  });

  it('should use default options', function(done) {
    var h = husk([1,2,3])
      .object()
      .run(done);
  });

  it('should convert array to object', function(done) {
    var h = husk([1,2,3,3,3])
      .object({schema: {a: 0, b: 1, c: -2}})
      .assert(function() {
        expect(this.a).to.eql('1');
        expect(this.b).to.eql('2');
        expect(this.c).to.eql('3 3 3');
        return true;
      })
      .run(done);
  });

  it('should convert array to object w/ delimiter', function(done) {
    var h = husk([1,2,3,3,3])
      .object({schema: {a: 0, b: 1, c: -2}, delimiter: ''})
      .assert(function() {
        expect(this.a).to.eql('1');
        expect(this.b).to.eql('2');
        expect(this.c).to.eql('333');
        return true;
      })
      .run(done);
  });

  it('should concatenate with array rule', function(done) {
    var h = husk([1,2,3,3,3])
      .object({schema: {a: [0,1], c: undefined}, delimiter: ''})
      .assert(function() {
        expect(this.a).to.eql('12');
        return true;
      })
      .run(done);
  });

  it('should concatenate with array rule missing index', function(done) {
    var h = husk([1, ''])
      .object({schema: {a: [0,1], c: undefined}, delimiter: ''})
      .assert(function() {
        expect(this.a).to.eql('1');
        return true;
      })
      .run(done);
  });

});
