var expect = require('chai').expect
  , husk = require('../..');

describe('husk:', function() {

  it('should return empty data on no chunks', function(done) {
    var h = husk('')
      .each()
      .concat()
      .run(done);
  });

  it('should concat strings', function(done) {
    var h = husk(['a', 'b', 'c'])
      .each()
      .concat()
      .assert(function() {
        return this.valueOf() === 'abc';
      })
      .run(done);
  });

  it('should concat strings w/ coerced value', function(done) {
    var h = husk(['a', 1, 'c'])
      .each()
      .concat()
      .assert(function() {
        return this.valueOf() === 'a1c';
      })
      .run(done);
  });

  it('should concat strings w/ encoding', function(done) {
    var h = husk(['a', 'b', 'c'])
      .each()
      .concat({enc: 'string'})
      .assert(function() {
        return this.valueOf() === 'abc';
      })
      .run(done);
  });

  it('should pass through w/ unknown encoding', function(done) {
    var h = husk(['a', 'b', 'c'])
      .each()
      .concat({enc: 'unknown'})
      .assert(function() {
        expect(this).to.eql(['a', 'b', 'c']);
        return true;
      })
      .run(done);
  });

  it('should pass through w/ unknown infer types', function(done) {
    var h = husk([{}, {}, {}])
      .each()
      .concat()
      .assert(function() {
        expect(this).to.eql([{},{},{}]);
        return true;
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

  it('should concat buffers w/ strings', function(done) {
    var h = husk([new Buffer('a'), new String('b'), 'c'])
      .each()
      .concat()
      .assert(function() {
        expect(Buffer.isBuffer(this)).to.eql(true);
        expect(this.toString()).to.eql('abc');
        return true;
      })
      .run(done);
  });

  it('should concat buffers w/ strings', function(done) {
    var h = husk(['a', new String('b'), new Buffer('c')])
      .each()
      .concat()
      .assert(function() {
        //expect(Buffer.isBuffer(this)).to.eql(true);
        expect(this.toString()).to.eql('abc');
        return true;
      })
      .run(done);
  });

  it('should concat uint8 arrays', function(done) {
    var h = husk([new Uint8Array([0]), new Uint8Array([255])])
      .each()
      .concat()
      .assert(function() {
        expect(this[0]).to.eql(0);
        expect(this[1]).to.eql(255);
        return true;
      })
      .run(done);
  });

  it('should concat uint8 arrays w/ encoding alias', function(done) {
    var h = husk([new Uint8Array([0]), new Uint8Array([255])])
      .each()
      .concat({enc: 'uint8'})
      .assert(function() {
        expect(this[0]).to.eql(0);
        expect(this[1]).to.eql(255);
        return true;
      })
      .run(done);
  });

});
