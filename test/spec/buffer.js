var husk = require('../..');

husk.plugin([require('husk-buffer')]);

describe('husk:', function() {

  it('should buffer input', function(done) {
    husk(__filename)
      .buffer()
      .assert(function(){return this.valueOf() === __filename})
      .run(done);
  });

});
