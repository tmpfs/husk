var husk = require('../')
  , linify = require('stream-lines')
  , splitify = require('../lib/split')
  , objectify = require('../lib/object')
  , jsonify = require('../lib/json');

var h = husk();
h.stdin()
  .pipe(linify())
  .pipe(splitify())
  .pipe(objectify({schema: {user: 0, line: 1, when: -2}}))
  .pipe(jsonify({indent: 2}))
  .pipe(process.stderr);
