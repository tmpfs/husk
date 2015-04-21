var assert = require('assert')
  , ProcessStream = require('process-flow');

/**
 *  Start stream transformations.
 *
 *  Run processes in parallel:
 *
 *  run(true)
 *
 *  Register event listener:
 *
 *  run(function(){})
 *
 *  @param opts Run options.
 *  @param cb A callback added as a once listener for the finished event.
 */
function run(opts, cb) {
  var scope = this
    , data = this.data
    , parallel = false
    , pipeline = this.pipeline.slice(0)
    , list = pipeline.slice()
    , first = pipeline[0]
    , next
    , kids
    , i
    , reader
    , writer
    , stream

  if(typeof opts === 'boolean') {
    parallel = opts;
    opts = null;
  }else if(typeof opts === 'function') {
    cb = opts;
    opts = null;
  // looks like a readable stream
  }else if(opts && opts.readable) {
    stream = opts;
    opts = null;
  }
  opts = opts || {};

  if(typeof opts.parallel === 'boolean') {
    parallel = opts.parallel;
  }

  if(pipeline.length) {

    function onEnd() {
      //console.log('' + this);
      scope.emit('end', this);
    }

    //console.log('connecting pipes (%s) (cmd: %s)', pipeline.length, this.cmd);
    reader = pipeline[0];

    // looks like readable stream passed to constructor
    // first in pipeline is writable so we pipe from input
    // readable to first in pipeline
    if(this.data && this.data.readable && reader.writable) {
      this.data.pipe(reader);

      // in this instance we cannot write initial data
      // as we are piping, clear the data to prevent write error
      data = null;
    }

    for(i = 1;i < pipeline.length;i++) {
      writer = pipeline[i];
      reader.unpipe();
      // TODO: use opts
      reader.info = {next: writer, previous: pipeline[i - 2] || null};
      reader.once('end', onEnd);
      reader = reader.pipe(writer);
    }

    reader.once('end', onEnd);

    // ensure last connection in pipe is terminated
    reader.on('readable', function() {
      var data = reader.read();
      // TODO: remove the additional test ???
      if(writer && (data === null || (data && data[0] === null))) {
        writer.end();
      }
    })

    if(typeof cb === 'function') {
      reader.once('finish', cb);
    }

    //console.log('run commands %s', this.pipeline.length);

    // series command execution
    if(!parallel
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

      first.once('executed', onExecuted);
      first.start();

      // NOTE: first must be started beforehand so that exec()
      // NOTE: can create the pipes correctly
      if(first.info.fd) {
        kids = list.slice(0);

        // find next process stream in chain
        while(next = kids.shift()) {
          if(next instanceof ProcessStream) {
            break;
          }
        }

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

    // write something to start the stream flowing
    if(data === undefined && !(first instanceof ProcessStream)) {
      data = '';
    }

    if(data !== undefined && data !== null) {
      if(this.opts.end) {
        this.pipeline[0].end(data);
      }else{
        this.pipeline[0].write(data);
      }
    }

  }else{
    if(typeof cb === 'function') {
      cb();
    }
  }

  return this;
}

/**
 *  Add a stream to the pipeline, returns `this` for chaining.
 */
function fuse(stream, id) {
  if(id) {
    stream.id = id;
  }
  //console.log('' + stream);
  this.pipeline.push(stream);
  return this;
}

/**
 *  Add a stream to the pipeline, returns the stream.
 */
function pipe(stream) {
  var cache, scope = this;
  if(stream) {
    // add to the pipeline
    this.fuse(stream);
    // ensure return values are also added to the pipeline
    cache = stream.pipe;
    stream.pipe = function(dest) {
      // restore cached method when called
      this.pipe = cache;
      // proxy to the outer pipe function (recurses)
      return scope.pipe.apply(scope, arguments);
    }
    stream.pipe.cache = cache;
  }
  return stream;
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

/**
 *  Read from initial process stdin.
 */
function stdin() {
  return this.fuse(process.stdin);
}

module.exports = function plugin() {
  this.fd = fd;
  this.run = run;
  this.fuse = fuse;
  this.pipe = pipe;
  this.stdin = stdin;

  // core dependencies
  this.plugin([require('husk-through'),  require('husk-print')]);
}
