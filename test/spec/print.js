var expect = require('chai').expect
  , fs = require('fs')
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
      .debug({raw: true}, function(chunk){
        expect(Buffer.isBuffer(chunk)).to.eql(true);
        expect('' + chunk).to.eql('foo');
      })
      .run(done);
  });

  it('should print with readable stream', function(done) {
    var reader = fs.createReadStream('/dev/null')
      , result;

    function complete() {
      // when the input is a readable stream
      // print will push itself and pipe the readable
      // to itself
      //expect(result.writable).to.eql(true);
      done();
    }

    husk()
      .debug()
      .print()
      .through(function(){result = this})
      .run({data: reader}, complete);
    reader.push(null);
  });


});
