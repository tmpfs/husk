var expect = require('chai').expect
  , husk = require('../..')
  , print = require('husk-print');

describe('husk:', function() {

  it('should print with console.dir()', function(done) {
    var dir = console.dir;
    console.dir = function(val) {
      console.dir = dir;
      expect(val).to.eql('foo');
      done();
    }
    var h = husk(new Buffer('foo'));
    h.pipe(print());
    h.run();
  });

  it('should debug with console.dir()', function(done) {
    var dir = console.dir;
    console.dir = function(val) {
      console.dir = dir;
      expect(val).to.eql('foo');
      done();
    }
    var h = husk(new Buffer('foo'))
      .debug({buffers: false})
      .run();
  });

  it('should debug with function', function(done) {
    var h = husk(new Buffer('foo'))
      .debug({buffers: true}, function(chunk){
        expect(Buffer.isBuffer(chunk)).to.eql(true);
        expect('' + chunk).to.eql('foo');
      })
      .run(done);
  });

});
