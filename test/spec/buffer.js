var husk = require('../..');

describe('husk:', function() {

  it('should buffer input', function(done) {
    var h = husk(__filename)
      .buffer()
      .assert(function(){return this.valueOf() === __filename})
      .run(done);
  });

});
