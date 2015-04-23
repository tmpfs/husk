var expect = require('chai').expect
  , fs = require('fs')
  , husk = require('../..')
  , process = require('husk-exec');

describe('husk:', function() {

  it('should not start if running', function(done) {
    var ps = process('pwd');

    // bind with null error so exit code does not
    // trigger mocha error
    ps.once('executed', done.bind(null, null));
    ps.start();
    // call again, should ignore
    ps.start();
  });

});
