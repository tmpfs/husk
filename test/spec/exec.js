var expect = require('chai').expect
  , husk = require('../..')
  , exec = require('husk-exec');

describe('husk:', function() {

  it('should execute command', function(done) {
    var h = husk()
      .ls('doc')
      .print(function(chunk) {
        expect(/readme/.test(chunk)).to.eql(true);
      })
      .debug(function noop(){})
      .run(done);
  });

  it('should override stdin to string', function(done) {
    expect('' + process.stdin).to.not.eql('[object Object]');
    done();
  });

  it('should execute command w/ pipe', function(done) {
    var h = husk()
    h.pipe(exec('ls', ['doc'])).on('end', done);
    h.run();
  });

  it('should callback on empty pipeline', function(done) {
    husk().run(done);
  });

  it('should pipe between processes', function(done) {
    husk()
      .ls('test')
      // pipe `ls` stdout to `cat` stdin
      .fd(1)
      .cat()
      .lines({buffer: true})
      .each()
      .reject(function(){return this.valueOf() === ''})
      .assert(function() {
        return this.valueOf() !== '';
      })
      .run(done);
  });

});
