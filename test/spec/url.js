var expect = require('chai').expect
  , husk = require('../..');

describe('husk:', function() {

  it('should pass through on unsupported type', function(done) {
    var result;
    function complete() {
      expect(result).to.be.an('array');
      done();
    }
    husk([])
      .url()
      .through(function(){result = this})
      .run(complete);
  });

  it('should parse and format url', function(done) {
    var url = 'https://example.com:443/#intro?var=foo'
      , result;
    function complete() {
      expect(result).to.be.an('object');
      expect(result.href).to.eql(url);
      expect(result.protocol).to.be.a('string');
      done();
    }
    husk(url)
      .url()
      // override `href` property with url.format()
      .url({field: 'href'})
      .through(function(){result = this})
      .run(complete);
  });

});
