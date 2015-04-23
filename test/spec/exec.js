var expect = require('chai').expect
  , husk = require('../..')
  , exec = require('husk-exec');

// trigger custom alias conf code path
husk.plugin([{plugin: exec, conf: {alias: exec.alias()}}]);

describe('husk:', function() {

  it('should create custom command', function(done) {
    husk.command('npm');
    var h = husk()
    expect(h.npm).to.be.a('function');
    done();
  });

  it('should create custom command w/ alias', function(done) {
    husk.command('npm', 'n');
    var h = husk()
    expect(h.n).to.be.a('function');
    done();
  });

  it('should execute command', function(done) {
    var h = husk()
      .ls('doc')
      .print(function(chunk) {
        expect(/readme/.test(chunk)).to.eql(true);
      })
      .debug(function noop(){})
      .run(done);
  });

  it('should execute command w/ callback', function(done) {
    husk()
      .whoami(function(code, signal) {
        expect(code).to.eql(0);
        expect(signal).to.eql(null);
        done();
      })
      .run();
  });

  it('should not wrap array argv', function(done) {
    husk()
      .exec('ls', ['doc'], function(code, signal) {
        expect(code).to.eql(0);
        expect(signal).to.eql(null);
        done();
      })
      .run();
  });

  it('should wrap multiple args', function(done) {
    husk()
      .exec('ls', 'doc', 'sbin', {}, {}, function(code, signal) {
        expect(code).to.eql(0);
        expect(signal).to.eql(null);
        done();
      })
      .run();
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
