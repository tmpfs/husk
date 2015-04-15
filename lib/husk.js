var util = require('util')
  , ProcessStream = require('process-flow')
  , plug = require('zephyr');

/**
 *  System entry point.
 */
function Husk(opts) {
  if(!(this instanceof Husk)) {
    return new Husk(opts);
  }
  ProcessStream.apply(this, arguments);
}

util.inherits(Husk, ProcessStream);

/**
 *  Start execution.
 *
 *  @param parallel Whether to run child processes in parallel.
 */
function run(parallel) {

  var children = this.children.slice(0);
  if(children.length) {
    var reader = this.children[0], writer;
    //console.log('connecting pipes (%s) (cmd: %s)', children.length, this.cmd);
    for(var i = 1;i < children.length;i++) {
      writer = children[i];
      reader.unpipe();
      reader = reader.pipe(writer);
    }
  }

  //console.log('run commands %s', this.children.length);

  if(this.stdin) {
    this.stdin();
  }

  var first = children[0];

  // series command execution
  if(!parallel && this.children.length && first instanceof ProcessStream) {

    children.shift();
    function onExecuted() {
      var next = children.shift();
      if(next instanceof ProcessStream) {
        next.once('executed', onExecuted);
        next.start();
      }
    }
    first.once('executed', onExecuted);
    first.start();

  // parallel command execution
  }else if(parallel) {
    this.children.forEach(function(stream) {
      if(stream instanceof ProcessStream) {
        stream.start();
      }
    })
  }
  return this;
}

/**
 *  Add a stream to the pipeline.
 */
function pipe(stream) {
  this.children = this.children || [];
  this.children.push(stream);
  return this;
}

/**
 *  Add a print stream to the chain.
 */
function print(stream) {
  return this.pipe(stream || process.stdout);
}

Husk.prototype.run = run;
Husk.prototype.pipe = pipe;
Husk.prototype.print = print;

// create plugin system
module.exports = plug({proto: Husk.prototype, type: Husk})
