var expect = require('chai').expect
  , fs = require('fs')
  , husk = require('../..');

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

  it('should accept function callback in run()', function(done) {
    var h = husk();
    var core = require('husk-core')
      , run = core.run;
    run.call(h, done);
  });


  it('should accept readable stream', function(done) {
    var reader = fs.createReadStream('/dev/null');
    var h = husk();
    var core = require('husk-core')
      , run = core.run;
    run.call(h, reader, done);
  });

  it('should pipe readable stream to first writer', function(done) {
    // typically this would be stdin
    var reader = fs.createReadStream('/dev/null');
    husk(reader)
      .print()
      .run(done);
  });

  it('should pipe readable stream to first writer (end: false)',
    function(done) {
      var h = husk('data', {end: false})
        .print()
        .run(done);
      h.pipeline[0].end();
    }
  );

  it('should pipe use run options data', function(done) {
    husk('data')
      .print()
      .run({data: 'override'}, done);
  });

  it('should ignore bad arg on pipe', function(done) {
    husk()
      .pipe(false);
    done();
  });

  it('should pipe to streams', function(done) {
    // triggers chained pipe recurse code path
    husk()
      .pipe(require('print-flow'))
      .pipe(require('print-flow'));
    done();
  });

});
