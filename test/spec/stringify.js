var expect = require('chai').expect
  , husk = require('../..');

describe('husk:', function() {

  it('should pass through unsupported type', function(done) {
    var h = husk(new Buffer(0))
      .stringify()
      .run(done);
  });

  it('should convert to json string', function(done) {
    var h = husk({a:1})
      .stringify()
      .assert(function() {
        return this.valueOf() === '{"a":1}\n';
      })
      .run(done);
  });

  it('should convert to json string w/ indent', function(done) {
    var h = husk({a:1})
      .stringify({indent: 1})
      .assert(function() {
        return this.valueOf() === '{\n "a": 1\n}\n';
      })
      .run(done);
  });

  it('should pluck source from chunk', function(done) {
    var h = husk({source: {a:1}})
      .stringify(function(){return this.source})
      .assert(function() {
        return this.valueOf() === '{"a":1}\n';
        return true;
      })
      .run(done);
  });

  it('should assign to field', function(done) {
    var h = husk({source: {a:1}})
      .stringify({field: 'doc'}, function(){return this.source})
      .assert(function() {
        return this.doc === '{"a":1}\n';
        return true;
      })
      .run(done);
  });

});
