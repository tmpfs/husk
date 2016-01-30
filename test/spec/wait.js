var expect = require('chai').expect
  , fs = require('fs')
  , husk = require('../..')
  , wait = require('husk-wait');

describe('husk:', function() {

  // must clear cache
  before(function(done) {
    delete require.cache[require.resolve('husk-wait')];
    husk.plugin([require('husk-wait')]);
    done();
  })

  it('should create wait stream with no options', function(done) {
    var w = wait();
    expect(w.opts).to.be.an('object');
    expect(w.opts.keypress).to.eql(true);
    expect(w.opts.nl).to.eql(true);
    expect(w.method).to.eql(undefined);
    expect(w.writer).to.equal(process.stdout);
    expect(w.reader).to.equal(process.stdin);
    done();
  });

  it('should create wait stream with function', function(done) {
    var func = function(){}
    var w = wait(func);
    expect(w.method).to.be.a('function');
    expect(w.method).to.eql(func);
    done();
  });

  it('should create wait stream with string', function(done) {
    var expected = '$>';
    var w = wait(expected);
    expect(w.output).to.eql(expected);
    done();
  });

  it('should create wait stream with custom options', function(done) {
    var func = function(){}
    var w = wait({keypress: false, nl: false}, func);
    expect(w.method).to.be.a('function');
    expect(w.method).to.eql(func);
    done();
  });

  it('should pass through on unsupported output', function(done) {
    husk()
      .wait({
        output: []
      })
      .run(done);
  });

  it('should create wait stream with custom reader and writer', function(done) {
    var reader = fs.createReadStream('/dev/null')
      , writer = fs.createWriteStream('/dev/null')
      , prompt = '$>'
      , message = 'hi';

    husk()
      .wait({
        keypress: false,
        reader: reader,
        writer: writer,
        output: prompt,
        input: message,
        block: true
      }, function written() {
        //console.dir(this);
        done();
      })
      .run();

      // assert on data pushed to reader
      reader.push = function(chunk) {
        if(chunk !== null) {
          expect(chunk).to.eql(message + '\r\n');
        }
      }

      writer.write('foo\r\n');

      // write out expected data
      writer.write(prompt);
  });

});
