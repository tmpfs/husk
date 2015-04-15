var expect = require('chai').expect
  , husk = require('../..');

describe('husk:', function() {

  it('should export function', function(done) {
    expect(husk).to.be.a('function');
    done();
  });
});
