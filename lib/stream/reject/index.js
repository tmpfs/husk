var util = require('util')
  , Filter = require('filter-flow');

/**
 *  Calls a function with each chunk of data to be transformed, if the
 *  function returns truthy it is rejected.
 */
function Reject() {
  Filter.apply(this, arguments);
  this.truthy = false;
}

util.inherits(Reject, Filter);

module.exports = Reject;
