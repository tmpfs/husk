var expect = require('chai').expect
  , fs = require('fs')
  , husk = require('../..');

// load all plugins
var dirs = fs.readdirSync('./node_modules');
dirs.forEach(function(dir) {
  if(/^husk-/.test(dir)) {
    husk.plugin([require(dir)]);
  }
})

describe('husk:', function() {

  it('should export function', function(done) {
    expect(husk).to.be.a('function');
    var h = husk();
    expect(h).to.be.instanceof(husk.Type);
    // new less style
    h = husk.Type(null, {end: false});
    expect(h).to.be.instanceof(husk.Type);
    expect(h.opts).to.be.an('object');
    expect(h.pipeline).to.be.an('array');
    //expect(h.data).to.eql(new Buffer(0));
    done();
  });

  it('should load plugins', function(done) {
    var h = husk.exec();
    expect(h).to.equal(husk);
    h = husk.fs();
    expect(h).to.equal(husk);
    done();
  });

});
