var expect = require('chai').expect
  , husk = require('../..')
  , prompt = require('husk-prompt')
  , ask = {message: 'choose directory:', default: 'lib'};

describe('husk:', function() {
  var owrite, ewrite;

  before(function(done) {
    //owrite = process.stdout.write;
    //ewrite = process.stderr.write;
    //process.stdout.write = noop;
    //process.stderr.write = noop;
    delete require.cache[require.resolve('husk-prompt')];
    husk.plugin([require('husk-prompt')]);
    delete require.cache[require.resolve('husk-wait')];
    husk.plugin([require('husk-wait')]);

    husk.plugin([
      // force terminal for sbin/ebin execution (stdin is pipe not tty)
      {plugin: require('husk-prompt'), conf: {terminal: true}},
      require('husk-wait')
    ])
    done();
  })

  after(function(done) {
    //owrite = process.stdout.write;
    //ewrite = process.stderr.write;
    //process.stdout.write = owrite;
    //process.stderr.write = ewrite;
    done();
  })

  it('should pass through with no function', function(done) {
    var h = husk()
      .prompt()
      .run(done);
  });

  it('should invoke function', function(done) {
    var h = husk();
    h.pipe(prompt(function(ps, chunk, encoding, cb){cb();}))
    h.run(done);
  });

  it('should execute prompt, wait and write', function(done) {
    var h = husk()
      .wait({output: husk.getPrompt(ask).raw, input: 'doc'})
      // show prompt
      .prompt(function(ps, chunk, encoding, cb) {
        ps.prompt(
          ask,
          function complete(err, val) {
            cb(err, val ? val[0] : null);
          })
      })
      // find files in chosen directory
      .find(function(){return [this.valueOf()]})
      .lines()
      .each()
      .reject(function(){return this.valueOf() === ''})
      .assert(function() {
        //console.dir(this);
        return Boolean(~this.indexOf('doc'));
      })
      .run(done);
  });

  it('should execute prompt w/ options, wait and write', function(done) {
    var h = husk()
      .wait({output: husk.getPrompt(ask).raw, input: 'doc'})
      // show prompt
      .prompt({terminal: true}, function(ps, chunk, encoding, cb) {
        ps.prompt(
          ask,
          function complete(err, val) {
            cb(err, val ? val[0] : null);
          })
      })
      // find files in chosen directory
      .find(function(){return [this.valueOf()]})
      .lines()
      .each()
      .reject(function(){return this.valueOf() === ''})
      .assert(function() {
        //console.dir(this);
        return Boolean(~this.indexOf('doc'));
      })
      .run(done);
  });


});
