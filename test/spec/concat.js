var expect = require('chai').expect
  , husk = require('../..');

describe('husk:', function() {

  it('should concat strings', function(done) {
    var h = husk(['a', 'b', 'c'])
      .each()
      .concat()
      .assert(function() {
        return this.valueOf() === 'abc';
      })
      .run(done);
  });

  it('should concat arrays', function(done) {
    var h = husk([['a'], ['b'], ['c']])
      .each()
      .concat()
      .assert(function() {
        expect(this).to.eql(['a', 'b', 'c'])
        return true;
      })
      .run(done);
  });

  it('should concat buffers', function(done) {
    var h = husk([new Buffer('a'), new Buffer('b'), new Buffer('c')])
      .each()
      .concat()
      .assert(function() {
        expect(Buffer.isBuffer(this)).to.eql(true);
        expect(this.toString()).to.eql('abc');
        return true;
      })
      .run(done);
  });

});
