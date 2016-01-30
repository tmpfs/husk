var expect = require('chai').expect
  , husk = require('../..');

describe('husk:', function() {

  it('should require with no aliases', function(done) {
    husk.plugin([{plugin: require('husk-http'), conf: {alias: false}}]);
    done();
  });

  it('should require with default aliases', function(done) {
    husk.plugin([{plugin: require('husk-http'), conf: {alias: true}}]);
    done();
  });

  it('should pass through on unsupported type', function(done) {
    var result;
    function complete() {
      expect(result).to.eql([]);
      done();
    }
    husk([])
      .request()
      .through(function(){result = this})
      .run(complete);
  });

  it('should GET url from string chunk', function(done) {
    var result;
    function complete() {
      // passes response socket stream
      expect(result.readable).to.eql(true);
      done();
    }
    husk('http://localhost:3000')
      .request()
      .through(function(){result = this})
      .run(complete);
  });

  it('should GET url with get() alias', function(done) {
    var result;
    function complete() {
      // passes response socket stream
      expect(result.readable).to.eql(true);
      done();
    }
    husk('http://localhost:3000')
      .get()
      .through(function(){result = this})
      .run(complete);
  });

});
