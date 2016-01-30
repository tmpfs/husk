var expect = require('chai').expect
  , husk = require('../..');

describe('husk:', function() {

  it('should emit error on bad json', function(done) {
    husk('{a:1}')
      .on('error', function(e) {
        function fn() {
          throw e;
        }
        expect(fn).throws(Error);
        done();
      })
      .parse()
      .run();
  });

  it('should pass through unsupported type', function(done) {
    husk([])
      .parse()
      .run(done);
  });

  it('should parse json string', function(done) {
    husk('{"a":1}')
      .parse()
      .assert(function() {
        return this.a === 1;
      })
      .run(done);
  });

  it('should parse json buffer', function(done) {
    husk(new Buffer('{"a":1}'))
      .parse()
      .assert(function() {
        return this.a === 1;
      })
      .run(done);
  });

  it('should parse with function', function(done) {
    husk()
      .parse(function(){return '{"a":1}'})
      .assert(function() {
        return this.a === 1;
      })
      .run(done);
  });

  it('should parse with options and function', function(done) {
    husk({})
      .parse({field: 'doc'}, function(){return '{"a":1}'})
      .assert(function() {
        return this.doc.a === 1;
      })
      .run(done);
  });

});
