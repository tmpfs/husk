var through = require('through3');

/**
 *  Get a corked stream instance.
 *
 *  Later this may be modified to support earlier versions
 *  of node that do not support cork().
 */
function buffer() {
  return new (through.cork())();
}

module.exports = buffer;
