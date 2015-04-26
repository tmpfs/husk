var expect = require('chai').expect
  , husk = require('../..');

describe('husk:', function() {

  it('should pass through on unsupported type', function(done) {
    var result;
    function complete() {
      expect(result).to.eql([]);
      done();
    }
    var h = husk([])
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
    var h = husk('http://localhost:3000')
      .request()
      .through(function(){result = this})
      .run(complete);
  });

});
