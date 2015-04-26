var expect = require('chai').expect
  , husk = require('../..')
  , io = husk.io;

describe('husk (io):', function() {

  it('should export classes', function(done) {
    expect(io.File).to.be.a('function');
    expect(io.DuplexFile).to.be.a('function');
    done();
  });

  it('should create file with fd integer', function(done) {
    var f = new io.File(1);
    expect(f.fd).to.eql(1);
    expect(f.opts).to.be.an('object');

    expect(f.isBuffer()).to.eql(false);
    expect(f.isStream()).to.eql(false);
    expect(f.isRemote()).to.eql(false);
    done();
  });

  it('should create file with file system path', function(done) {
    var path = './file.txt';
    var f = io.file(path);
    expect(f.fd).to.eql(null);
    expect(f.path).to.eql(path);
    expect(f.url).to.be.an('object');

    expect(f.isBuffer()).to.eql(false);
    expect(f.isStream()).to.eql(false);
    expect(f.isRemote()).to.eql(false);
    done();
  });

});
