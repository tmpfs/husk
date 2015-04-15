var husk = require('../')
  , lines = require('husk-lines')
  , split = require('husk-split')
  , obj = require('husk-object')
  , stringify = require('husk-stringify');

var h = husk();
h.stdin()
  .pipe(lines())
  .pipe(split())
  .pipe(obj({schema: {user: 0, line: 1, when: -2}}))
  .pipe(stringify({indent: 2}))
  .pipe(process.stderr);
