var assert = require('assert')
  , PrintStream = require('print-flow')
  , ProcessStream = require('process-flow');

/**
 *  Start execution.
 *
 *  @param parallel Whether to run child processes in parallel.
 */
function run(parallel) {
  var pipeline = this.pipeline.slice(0)
    , i
    , reader
    , writer;

  if(pipeline.length) {
    //console.log('connecting pipes (%s) (cmd: %s)', pipeline.length, this.cmd);
    reader = this.pipeline[0];
    for(i = 1;i < pipeline.length;i++) {
      writer = pipeline[i];
      //console.dir(reader);
      reader.unpipe();
      reader = reader.pipe(writer, {end: true});
    }
  }

  //console.log('run commands %s', this.pipeline.length);

  var first = pipeline[0]
    , next
    , list = pipeline.slice()
    , kids;

  // series command execution
  if(!parallel
    && this.pipeline.length
    && (first instanceof ProcessStream)) {

    list.shift();

    function onExecuted() {
      next = list.shift();
      if(next instanceof ProcessStream) {
        next.once('executed', onExecuted);
        next.start();
      }else{
        // if next is not a process stream we need to call
        // end for the data to keep flowing
        this.end();
      }
    }

    //console.log('starting first in series: %s', first.cmd);

    first.once('executed', onExecuted);
    first.start();

    // NOTE: first must be started beforehand so that exec()
    // NOTE: can create the pipes correctly
    if(first.info.fd) {
      //console.log('first child has fd: %s', first.info.fd);
      //console.log('finding next...');

      kids = list.slice(0);

      // find next process stream in chain
      while(next = kids.shift()) {
        if(next instanceof ProcessStream) {
          break;
        }
      }

      //console.log('got next %s', next.cmd);

      // when a command has an fd id it should pipe it's fd
      // to the stdin of the next command in the chain, when
      // running in series we need to ensure the next command
      // is started at the same time as the command with fd assigned
      // for the pipe to work
      next.once('executed', onExecuted);
      next.start();
    }


  // parallel command execution
  }else if(parallel) {
    this.pipeline.forEach(function(stream) {
      if(stream instanceof ProcessStream) {
        stream.start();
      }
    })
  }

  if(this.data !== undefined && this.pipeline.length) {
    if(this.opts.end) {
      this.pipeline[0].end(this.data);
    }else{
      this.pipeline[0].write(this.data);
    }
  }

  return this;
}

/**
 *  Add a stream to the pipeline.
 */
function pipe(stream) {
  // piping between child processes
  if(typeof stream === 'number') {
    this.fd(stream);
  // adding a stream to the chain
  }else{
    this.pipeline.push(stream);
  }
  return this;
}

/**
 *  Add a print stream to the chain.
 */
function print(stream, opts) {
  if(typeof stream === 'function') {
    return this.pipe(new PrintStream(stream, opts));
  }
  return this.pipe(stream || process.stdout);
}

/**
 *  Debug stream chunks.
 */
function debug(opts) {
  opts = opts || {buffers: true};
  return this.print(console.dir, opts);
}

/**
 *  Read from initial process stdin.
 */
function stdin() {
  return this.pipe(process.stdin);
}

// fd identifier when piping between child processes
function fd(num) {
  // use default -1 fd on no args
  num = num === undefined ? -1 : num;

  // (combined | stdout | stderr) -> stdin
  assert(
    num === -1 || num === 1 || num === 2,
    'invalid fd for process pipe, expecting: -1, 1 or 2');

  // last child is the previous command (reader)
  // at this point we don't know which command to pipe to.
  // the next command in the chain is not defined yet
  var last = this.pipeline[this.pipeline.length - 1];
  assert(last, 'cannot pipe from fd with no previous stream');
  assert(
    last instanceof ProcessStream,
    'cannot pipe from fd when last stream is not a process stream');

  if(last && last.info) {
    // flag as muted so the process stream does not pass through
    // which would cause a duplication
    last.info.muted = true;

    // assign fd to process stream info
    last.info.fd = num;
  }
  return this;
}

module.exports = function plugin() {
  this.fd = fd;
  this.run = run;
  this.pipe = pipe;
  this.print = print;
  this.debug = debug;
  this.stdin = stdin;
}
