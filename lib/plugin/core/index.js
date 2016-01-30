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
    , pipeline = this.pipeline.slice(0)
    , i
    , reader
    , writer;

  function onError(err) {
    scope.emit('error', err);
  }

  //console.dir('run called: ' + data);

  if(typeof opts === 'function') {
    cb = opts;
    opts = null;
  // looks like a readable stream
  }else if(opts && opts.readable) {
    this.data = opts;
    opts = null;
  }

  opts = opts && typeof opts === 'object' ? opts : {};

  // options data overrides assigned data
  if(opts.data !== undefined) {
    data = opts.data;
  }

  //console.log('run with pipes (%s)', pipeline.length);

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
      reader.info = reader.info || {};
      reader.info.next = writer;
      reader.info.previous = pipeline[i - 2] || null;
      reader.once('error', onError);
      reader.once('end', onEnd);
      reader = reader.pipe(writer);
    }

    reader.once('error', onError);
    reader.once('end', onEnd);

    // ensure last connection in pipe is terminated
    reader.on('readable', function(size) {
      var data = reader.read(size);
      if(data === null) {
        reader.end();
      }
    })

    if(typeof cb === 'function') {
      reader.once('finish', cb);
    }

    if(data !== undefined && data !== null) {
      //console.log('writing data: ' + data);
      //console.log(this.opts.end);
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

function plugin() {
  // core dependencies: through/print/debug
  this.plugin([require('husk-through'),  require('husk-print')]);

  // core functions
  this.run = run;
  this.fuse = fuse;
  this.pipe = pipe;
}

plugin.run = run;

module.exports = plugin;
