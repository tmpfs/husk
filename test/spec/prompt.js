var expect = require('chai').expect
  , husk = require('../..')
  , ask = {message: 'choose directory:', default: 'lib'};

describe('husk:', function() {

  //this.timeout(500);

  before(function(done) {
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
        console.dir(this.valueOf());
        return true;
      })
      .on('finish', function() {
        console.log('finish...');
      })
      .run(done);
  });

});
