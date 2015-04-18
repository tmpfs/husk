var assert = require('assert')
  , ProcessStream = require('process-flow');

/**
 *  Start execution.
 *
 *  @param parallel Whether to run child processes in parallel.
 */
function run(parallel, cb) {

  if(typeof parallel === 'function') {
    cb = parallel;
    parallel = false;
  }

  var pipeline = this.pipeline.slice(0)
    , i
    , reader
    , writer;

  if(pipeline.length) {

    // ensure any cached pipe overrides are restored
    this.pipeline.forEach(function(st) {
      if(st && st.pipe && st.pipe.cache) {
        st.pipe = st.pipe.cache;
      }
    })

    //console.log('connecting pipes (%s) (cmd: %s)', pipeline.length, this.cmd);
    reader = this.pipeline[0];
    for(i = 1;i < pipeline.length;i++) {
      writer = pipeline[i];
      reader.unpipe();
      reader = reader.pipe(writer);
    }

    // ensure last connection in pipe is terminated
    reader.on('readable', function() {
      var data = reader.read();
      //console.dir(data);
      // TODO: remove the additional test ???
      if(data === null || (data && data[0] === null)) {
        writer.end();
      }
    })

    if(typeof cb === 'function') {
      reader.once('finish', cb);
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

    if(this.data !== undefined) {
      if(this.opts.end) {
        this.pipeline[0].end(this.data);
      }else{
        this.pipeline[0].write(this.data);
      }
    }

  }

  return this;
}

/**
 *  Add a stream to the pipeline, returns `this` for chaining.
 */
function fuse(stream, id) {
  //stream.once('end', function(){console.log('stream ended');})
  if(id) {
    stream.id = id;
  }
  //console.log('' + stream);
  this.pipeline.push(stream);
  // proxy event methods to the stream until the
  // next stream is added to the pipeline
  if(stream && typeof stream.on === 'function') {
    var evt = ['on', 'once', 'removeListener', 'removeAllListeners'];
    evt.forEach(function(nm) {
      this[nm] = function() {
        //console.log('stream nm: ' + stream[nm]);
        stream[nm].apply(stream, arguments);
        return this;
      }
    }.bind(this));
  }
  return this;
}

/**
 *  Add a stream to the pipeline, returns the stream.
 */
function pipe(stream, opts, husk) {
  var cache;
  husk = husk || this;
  //console.dir(stream);
  //console.log('adding stream: ' + stream);
  if(stream) {
    // add to the pipeline
    this.fuse(stream);
    // ensure return values are also added to the pipeline
    cache = stream.pipe;
    stream.pipe = function(dest) {
      //console.log('restoring pipe from cache:');
      // restore cached method when called
      this.pipe = cache;
      // proxy to the outer pipe function (recurses)
      return husk.pipe.apply(husk, arguments);
    }
    stream.pipe.cache = cache;
  }
  //stream.once('finish', function(){console.log('stream ended')})
  //console.dir(stream);
  return stream;
}

/**
 *  Read from initial process stdin.
 */
function stdin() {
  return this.fuse(process.stdin);
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
  this.fuse = fuse;
  this.pipe = pipe;
  this.stdin = stdin;
}
