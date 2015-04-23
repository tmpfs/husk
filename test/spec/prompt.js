var expect = require('chai').expect
  , fs = require('fs')
  , husk = require('../..')
  , prompt = require('husk-prompt')
  , ask = {message: 'choose directory:', default: 'lib'};

describe('husk:', function() {

  before(function(done) {
    delete require.cache[require.resolve('husk-prompt')];
    delete require.cache[require.resolve('husk-wait')];

    husk.plugin([
      // force terminal for sbin/ebin execution (stdin is pipe not tty)
      {plugin: require('husk-prompt'), conf: {terminal: true}},
      require('husk-wait')
    ])
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

  it('should handle prompt with no options', function(done) {
    var h = husk()
      // show prompt
      .prompt(function(ps, chunk, encoding, cb) {
        cb();
      })
      .run(done);
  });


  it('should execute prompt, wait and write', function(done) {
    // jump through some hoops to suppress the output and keep
    // the test runner output clean
    var reader = fs.createReadStream('/dev/null')
      , writer = fs.createWriteStream('/dev/null')
      , prompt = husk.getPrompt(ask).prompt;
    var h = husk()
      .wait(
        {
          output: prompt,
          input: 'doc',
          reader: reader,
          writer: writer,
          keypress: false})
      // show prompt
      .prompt({input: reader, output: writer}, function(ps, chunk, encoding, cb) {
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
        return Boolean(~this.indexOf('doc'));
      })
      .run(done);

      // write out expected data
      writer.write(prompt);
  });

  it('should execute prompt w/ keypress, wait and write', function(done) {
    // jump through some hoops to suppress the output and keep
    // the test runner output clean
    var reader = fs.createReadStream('/dev/null')
      , writer = fs.createWriteStream('/dev/null')
      , prompt = husk.getPrompt(ask).prompt;

    var h = husk()
      .wait(
        {
          output: prompt,
          input: 'doc',
          reader: reader,
          writer: writer})
      // show prompt
      .prompt({input: reader, output: writer}, function(ps, chunk, encoding, cb) {
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
        return Boolean(~this.indexOf('doc'));
      })
      .run(done);

      // simulate keypress logic
      reader.once('keypress', function(chunk) {
        reader.push(chunk);
      })

      // write out expected data
      writer.write(prompt);
  });


});
