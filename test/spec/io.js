var expect = require('chai').expect
  , fs = require('fs')
  , husk = require('../..')
  , io = husk.io;

describe('husk (io):', function() {

  it('should export classes', function(done) {
    expect(io.File).to.be.a('function');
    expect(io.DuplexFile).to.be.a('function');
    done();
  });

  it('should ignore invalid path type', function(done) {
    var f = new io.File([]);
    expect(f.opts).to.be.an('object');
    expect(f.path).to.eql(null);
    done();
  });

  it('should create file with fd integer', function(done) {
    var s = 1;
    var f = new io.File(s);
    expect(f.fd).to.eql(s);
    expect(f.opts).to.be.an('object');

    expect(f.isBuffer()).to.eql(false);
    expect(f.isStream()).to.eql(false);
    expect(f.isRemote()).to.eql(false);
    expect(f.isContent()).to.eql(false);
    done();
  });

  it('should create file with file system path', function(done) {
    var s = './file.txt';
    var f = io.file(s);
    expect(f.fd).to.eql(null);
    expect(f.path).to.eql(s);
    expect(f.url).to.be.an('object');

    expect(f.isBuffer()).to.eql(false);
    expect(f.isStream()).to.eql(false);
    expect(f.isRemote()).to.eql(false);
    expect(f.isContent()).to.eql(false);
    done();
  });

  it('should create file with remote http path', function(done) {
    var s = 'http://example.com/?var=foo';
    var f = io.file(s);
    expect(f.fd).to.eql(null);
    expect(f.path).to.eql(s);
    expect(f.url).to.be.an('object');

    expect(f.isBuffer()).to.eql(false);
    expect(f.isStream()).to.eql(false);
    expect(f.isRemote()).to.eql(true);
    expect(f.isContent()).to.eql(false);
    done();
  });

  it('should create duplex file', function(done) {
    var s = 'file.txt'
      , t = 'file.txt.bak';

    var f = io.duplex(s, t);
    expect(f.source).to.be.an('object');
    expect(f.target).to.be.an('object');
    expect(f.source.path).to.eql(s);
    expect(f.target.path).to.eql(t);
    done();
  });

  it('should create file with buffer body', function(done) {
    var s = './file.txt'
      , b = new Buffer(0);

    var f = io.file(s, b);
    expect(f.fd).to.eql(null);
    expect(f.path).to.eql(s);
    expect(f.body).to.eql(b);
    expect(f.url).to.be.an('object');
    expect(f.isBuffer()).to.eql(true);
    expect(f.isStream()).to.eql(false);
    expect(f.isRemote()).to.eql(false);
    expect(f.isContent()).to.eql(true);
    done();
  });

  it('should create file with read stream body', function(done) {
    var s = './file.txt'
      , b = fs.createReadStream('/dev/null');
    var f = io.file(s, b);
    expect(f.path).to.eql(s);
    expect(f.body).to.eql(b);
    expect(f.url).to.be.an('object');
    expect(f.isBuffer()).to.eql(false);
    expect(f.isStream()).to.eql(true);
    expect(f.isRemote()).to.eql(false);
    expect(f.isContent()).to.eql(true);
    done();
  });

  it('should create file with write stream body', function(done) {
    var s = './file.txt'
      , b = fs.createWriteStream('/dev/null');
    var f = io.file(s, b);
    expect(f.path).to.eql(s);
    expect(f.body).to.eql(b);
    expect(f.url).to.be.an('object');
    expect(f.isBuffer()).to.eql(false);
    expect(f.isStream()).to.eql(true);
    expect(f.isRemote()).to.eql(false);
    expect(f.isContent()).to.eql(true);
    done();
  });

  it('should create file with body option (string)', function(done) {
    var s = './file.txt'
      , b = 'bar';

    var f = io.file(s, {body: b});
    expect(f.path).to.eql(s);
    expect(f.body).to.eql(b);
    expect(f.isBuffer()).to.eql(false);
    expect(f.isStream()).to.eql(false);
    expect(f.isRemote()).to.eql(false);
    expect(f.isContent()).to.eql(true);
    done();
  });

  it('should create file with read stream path', function(done) {
    var s = '/dev/null'
      , b = fs.createReadStream(s);
    var f = io.file(b);
    expect(f.path).to.eql(s);
    expect(f.body).to.eql(b);
    expect(f.url).to.be.an('object');
    expect(f.isBuffer()).to.eql(false);
    expect(f.isStream()).to.eql(true);
    expect(f.isRemote()).to.eql(false);
    expect(f.isContent()).to.eql(true);
    done();
  });

  it('should create file with buffer path', function(done) {
    var s = '/dev/null'
      , b = new Buffer(0);
    var f = io.file(b);
    expect(f.path).to.eql(null);
    expect(f.body).to.eql(b);
    expect(f.isBuffer()).to.eql(true);
    expect(f.isStream()).to.eql(false);
    expect(f.isRemote()).to.eql(false);
    expect(f.isContent()).to.eql(true);
    done();
  });

});
