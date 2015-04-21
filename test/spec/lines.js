var husk = require('../..');

describe('husk:', function() {

  it('should iterate lines', function(done) {
    var h = husk('3\n2\n1')
      .lines({buffer: true})
      .each()
      .reject(function(){
        return this.valueOf() !== '1'
      })
      .assert(function() {
        return (this.valueOf() === '1');
      })
      .run(done);
  });

});
