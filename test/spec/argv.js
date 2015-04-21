var expect = require('chai').expect
  , husk = require('../..')
  , argv = require('husk-argv');

describe('husk:', function() {

  it('should parse chunk argv', function(done) {
    var args = [__dirname, __filename];
    var h = husk(args)
      .argv()
      .through(function(){
        expect(this.unparsed).to.eql(args);
      })
      .run(done);
  });

  it('should parse default argv', function(done) {
    var h = husk()
      .argv()
      .through(function(){
        expect(Boolean(~this.unparsed.indexOf('bdd'))).to.eql(true);
      })
      .run(done);
  });

});
