var expect = require('chai').expect
  , husk = require('../..')
  , assert = require('husk-assert');

describe('husk:', function() {

  it('should assert on chunk', function(done) {
    var h = husk(__filename)
      .assert(function(){return this instanceof String})
      .run(done);
  });

});
