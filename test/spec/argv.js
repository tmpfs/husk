var expect = require('chai').expect
  , husk = require('../..');

describe('husk:', function() {

  it('should parse chunk argv', function(done) {
    var args = [__dirname, __filename];
    husk(args)
      .argv()
      .through(function(){
        expect(this.unparsed).to.eql(args);
      })
      .run(done);
  });

  it('should parse default argv', function(done) {
    husk()
      .argv()
      .through(function(){
        expect(Boolean(~this.unparsed.indexOf('bdd'))).to.eql(true);
      })
      .run(done);
  });

});
