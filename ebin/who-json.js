var husk = require('../');

husk.plugin([
  require('husk-lines'),
  require('husk-split'),
  require('husk-object'),
  require('husk-stringify'),
]);

var h = husk();
var n = h.stdin()
  .lines()
  .split()
  .object({schema: {user: 0, line: 1, when: -2}})
  .stringify({indent: 2})
  .pipe(process.stdout);
