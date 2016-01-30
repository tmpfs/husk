Table of Contents
=================

* [Husk](#husk)
  * [Install](#install)
  * [Usage](#usage)
  * [Plugin Guide](#plugin-guide)
  * [Examples](#examples)
    * [argv](#argv)
    * [async](#async)
    * [data-write](#data-write)
    * [exec](#exec)
    * [filter](#filter)
    * [fs](#fs)
    * [hash](#hash)
    * [modify-file](#modify-file)
    * [parallel](#parallel)
    * [pluck](#pluck)
    * [plugin-events](#plugin-events)
    * [process-pipe](#process-pipe)
    * [prompt](#prompt)
    * [push](#push)
    * [reject](#reject)
    * [series](#series)
    * [stdin](#stdin)
    * [stream-events](#stream-events)
    * [transform](#transform)
    * [url](#url)
    * [zlib](#zlib)
  * [Developer](#developer)
    * [Install](#install-1)
    * [Link](#link)
    * [Example](#example)
    * [Test](#test)
    * [Cover](#cover)
    * [Documentation](#documentation)
    * [Readme](#readme)
  * [License](#license)

Husk
====

[<img src="https://travis-ci.org/tmpfs/husk.svg" alt="Build Status">](https://travis-ci.org/tmpfs/husk)
[<img src="http://img.shields.io/npm/v/husk.svg" alt="npm version">](https://npmjs.org/package/husk)
[<img src="https://coveralls.io/repos/tmpfs/husk/badge.svg?branch=master&service=github&v=1" alt="Coverage Status">](https://coveralls.io/github/tmpfs/husk?branch=master).

Modular stream transformation system using a plugin architecture.

Designed with command execution and file manipulation at the core it is flexible enough for many common tasks.

Requires [node](http://nodejs.org) and [npm](http://www.npmjs.org).

## Install

```
npm i husk --save
```

## Usage

```javascript
var husk = require('husk').exec();
husk()
  .pwd()
  .ls()
  .print()
  .run();
```

## Plugin Guide

Plugin functionality is provided by [zephyr](https://github.com/tmpfs/zephyr) see the [zephyr plugins](https://github.com/tmpfs/zephyr#plugins) documentation.

Plugin implementations that encapsulate a stream should export a function that creates a new stream so that the plugin is fully compatible with calling `pipe()` and define a `plugin` function that defines the plugin functionality, see [argv](https://github.com/tmpfs/husk/blob/master/lib/plugin/argv/index.js).

For plugins that do not expose a stream they can export the plugin function directly, see [core](https://github.com/tmpfs/husk/blob/master/lib/plugin/core/index.js).

The design of the system is such that the plugins and stream implementations are separate modules so that the streams may be used outside of the plugin system if required. The majority of the plugins are thin wrappers for the stream to support chained method calls without always calling `pipe()` directly.

## Examples

### argv

Extract values from program arguments.

```
ebin/argv index.js package.json
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..').fs()
  .plugin([
    require('husk-argv'),
    require('husk-concat'),
    require('husk-pluck'),
    require('husk-each'),
    require('husk-transform'),
    require('husk-stringify')
  ]);

husk(process.argv.slice(2))
  .argv()
  .pluck(function(){return this.unparsed})
  .each()
  .stat(function(){return [this.valueOf()]})
  .transform(function(){return [{size: this.size}]})
  .concat()
  .stringify({indent: 2})
  .print()
  .run();
```

**Result**.

```
undefined
[
  {
    "size": 40
  },
  {
    "size": 1965
  }
]
```

### async

Pass data to async functions.

```
ebin/async
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..').exec()
  .plugin([
    require('husk-async'),
    require('husk-pluck')
  ]);

function timer(cb) {
  var chunk = this.valueOf();
  if(!chunk.length) return cb(null, chunk);
  function callback() {
    var s = ('' + chunk).trim().split('').reverse().join('') + '\n';
    cb(null, s);
  }
  setTimeout(callback, 10);
}

husk()
  .ls('lib')
  .async(timer)
  .pluck(0)
  .print()
  .run();
```

**Result**.

```
maerts
nigulp
sj.ksuh
```

### data-write

Pass data to be written on run.

```
ebin/data-write
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..')
  .plugin([
    require('husk-transform'),
    require('husk-stringify')
  ]);

husk(process.env)
  .transform(function(){return {editor: this.EDITOR}})
  .stringify({indent: 2})
  .print()
  .run();
```

**Result**.

```
undefined
{
  "editor": "vim"
}
```

### exec

Execute an external command with callback and listener.

```
ebin/exec
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..').exec();

husk()
  .whoami(function(code, signal) {
    console.log('[code: %s, signal: %s]', code, signal);
  })
  .once('end', console.log.bind(null, '%s'))
  .print()
  .run();
```

**Result**.

```
muji
[code: 0, signal: null]
[Process:Transform] whoami
```

### filter

Filter array of lines with accept function.

```
ebin/filter
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..').exec()
  .plugin([
    require('husk-lines'),
    require('husk-each'),
    require('husk-filter'),
    require('husk-split'),
    require('husk-object'),
    require('husk-stringify')
  ]);

husk()
  .ps('ax')
  .lines({buffer: true})
  .each()
  .filter(function(){
    return parseInt(this.split(/\s+/)[0].trim()) === process.pid
  })
  .split()
  .object({schema: {pid: 0, tt: 1, stat: 2, time: 3, cmd: -4}})
  .stringify({indent: 2})
  .print()
  .run();
```

**Result**.

### fs

Open fd, write close and print file content.

```
ebin/fs
```

**Source**.

```javascript
#!/usr/bin/env node

var path = require('path')
  , husk = require('..').exec().fs()
  .plugin([
    require('husk-pluck')
  ]);

var name = path.basename(__filename) + '-example.log'
  , content = '[file content]';

husk()
  .open(name, 'w')
  .pluck(1)
  .async(function writer(cb) {
    var fd = this.valueOf();
    var h = husk(fd)
      // write to fd is aliased write() -> fdwrite()
      .fdwrite(fd, content)
      .close(fd)
      .run(cb);
  })
  // re-read and print file to verify write
  .cat(name)
  .print(console.log)
  // clean up file
  .unlink(name)
  .run();
```

**Result**.

```
[file content]
```

### hash

Stream multiple files to multiple hash checksums.

```
ebin/hash
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..').exec().fs()
  .plugin([
    require('husk-concat'),
    require('husk-hash'),
    require('husk-lines'),
    require('husk-each'),
    require('husk-reject'),
    require('husk-stringify'),
    require('husk-transform'),
  ]);

husk()
  .find('lib/plugin/exec', '-name', '*.js')
  .lines()
  .each()
  .reject(function(){return this.valueOf() === ''})
  .read({buffer: false})
  .hash({
    algorithm: ['sha1', 'md5'], enc: 'hex', passthrough: true, field: 'hash'})
  .transform(function(){return {file: this.path, hash: this.hash}})
  .reject(function(){
    return this.file === undefined
      || !this.hash || this.hash.sha1 === undefined;
  })
  .concat()
  .stringify({indent: 2})
  .print()
  .run();
```

**Result**.

```
undefined
[
  {
    "file": "lib/plugin/exec/alias.js",
    "hash": {
      "sha1": "a82a88fb21865c7592ce6237b1c3765be4968126",
      "md5": "91706a26c49eb622a3539a3a48f04b37"
    }
  },
  {
    "file": "lib/plugin/exec/index.js",
    "hash": {
      "sha1": "972513e4a08106fdc40b896e5b82d173c961391a",
      "md5": "070027151d1a2b74924bb409885a0cbb"
    }
  }
]
```

### modify-file

Read, parse, modify and write out file.

```
ebin/modify-file
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..').exec().fs()
  .plugin([
    require('husk-parse'),
    require('husk-transform'),
    require('husk-stringify'),
  ]);

var input = 'package.json'
  , output = 'dependencies.json';

husk(input)
  .read()
  // parse as json and assign
  .parse({field: 'body'}, function(){return this.body})
  // perform transformation
  .transform(function() {
    var body = this.body;
    for(var k in body.dependencies) {
      body.dependencies[k] = '~2.0.0';
    }
    return this;
  })
  // back to string for write
  .stringify(
    {indent: 2, field: 'contents'},
    function(){return this.body.dependencies})
  .write(function(){return [output]})
  // re-read and print file to verify write
  .cat(output)
  .print()
  // clean up file
  .unlink(output)
  .run();
```

**Result**.

```
undefined
{
  "husk-async": "~2.0.0",
  "husk-core": "~2.0.0",
  "husk-exec": "~2.0.0",
  "husk-fs": "~2.0.0",
  "zephyr": "~2.0.0"
}
```

### parallel

Execute commands in parallel.

```
ebin/parallel
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..').exec();

husk()
  .echo('foo', 'bar')
  .echo('baz', 'qux')
  .print()
  .run(true);
```

**Result**.

```
foo bar
baz qux
```

### pluck

Read json from filesystem and pluck field.

```
ebin/pluck
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..').fs()
  .plugin([
    require('husk-parse'),
    require('husk-pluck'),
    require('husk-stringify'),
  ]);

var path = require('path')
  , output = 'target';

husk('package.json')
  .read()
  .parse(function(){return this.body})
  .pluck(function(){return this.dependencies})
  .stringify({indent: 2})
  .print()
  .run();
```

**Result**.

```
undefined
{
  "husk-async": "~1.0.2",
  "husk-core": "~1.0.4",
  "husk-exec": "~1.0.4",
  "husk-fs": "~1.0.2",
  "zephyr": "~1.2.6"
}
```

### plugin-events

Listen on streams using plugin chain.

```
ebin/plugin-events
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..').exec()
  .plugin([
    require('husk-concat'),
    require('husk-buffer'),
    require('husk-lines'),
    require('husk-each'),
    require('husk-filter'),
    require('husk-transform'),
    require('husk-stringify')
  ]);

function onEnd(stream) {
  console.log('' + stream);
}

husk()
  .cd('lib')
  .find()
  .buffer()
  .lines()
  .each()
  .filter(function(){return /\.md$/.test(this)})
  .transform(function(){return [this]})
  .concat()
  .stringify({indent: 2})
  .print(function noop(){})
  .on('end', onEnd)
  .run();
```

**Result**.

```
[Process:Transform] find 
[Buffer:PassThrough]
[Line:Transform]
[Each:Transform]
[Filter:Transform]
[Transform:Transform]
undefined
[Concat:Transform]
[Stringify:Transform]
[Print:Transform] noop
```

### process-pipe

Pipe stdout of a command to the stdin of the next command.

```
ebin/process-pipe
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..').exec();

husk()
  .ls('lib')
  // pipe `ls` stdout to `cat` stdin
  .fd(1)
  .cat()
  .print()
  .run();
```

**Result**.

```
husk.js
plugin
stream
```

### prompt

Prompt for user input.

```
ebin/prompt
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..').exec()
  .plugin([
    require('husk-prompt'),
    require('husk-wait')
  ])
  , ask = {message: 'choose directory:', default: 'lib'};

husk()
  // auto fill prompt so it can be automated
  .wait({output: husk.getPrompt(ask).prompt, input: 'doc'})
  // show prompt
  .prompt(function(ps, chunk, encoding, cb) {
    ps.prompt(
      ask,
      function complete(err, val) {
        ps.close();
        cb(err, val ? val[0] : null);
      })
  })
  // find files in chosen directory
  .find(function(){return [this.valueOf()]})
  .print()
  .run();
```

**Result**.

```
prompt ⚡ choose directory: (lib) doc
doc/readme
doc/readme/install.md
doc/readme/links.md
doc/readme/introduction.md
doc/readme/usage.md
doc/readme/developer.md
doc/readme/plugins.md
doc/readme/license.md
```

### push

Push multiple chunks.

```
ebin/push
```

**Source**.

```javascript
#!/usr/bin/env node

var path = require('path')
  , util = require('util')
  , husk = require('..').fs()
  .plugin([
    require('husk-push')
  ]);

husk()
  .stat(__filename)
  .push(function(chunk) {
    this.push(
      util.format('%s (%s bytes)', path.basename(__filename), chunk.size)
    );
    this.push(
      __filename.replace(path.normalize(path.join(__dirname, '..')), '.')
    );
  })
  .print(console.log)
  .run();
```

**Result**.

```
push (431 bytes)
./ebin/push
```

### reject

Filter array of lines with reject function.

```
ebin/reject
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..').exec()
  .plugin([
    require('husk-lines'),
    require('husk-each'),
    require('husk-reject'),
    require('husk-split'),
    require('husk-object'),
    require('husk-stringify')
  ]);

husk()
  .ps('ax')
  .lines({buffer: true})
  .each()
  .reject(function(){
    return parseInt(this.split(/\s+/)[0].trim()) !== process.pid
  })
  .split()
  .object({schema: {pid: 0, tt: 1, stat: 2, time: 3, cmd: -4}})
  .stringify({indent: 2})
  .print()
  .run();
```

**Result**.

### series

Execute commands in series.

```
ebin/series
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..').exec();

husk()
  .echo(1, 2, 3)
  .sleep(.5)
  .echo('foo', 'bar')
  .print()
  .run();
```

**Result**.

```
1 2 3
foo bar
```

### stdin

Pipe stdin to various plugins to produce json.

```
who | ebin/stdin
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..')
  .plugin([
    require('husk-lines'),
    require('husk-each'),
    require('husk-split'),
    require('husk-object'),
    require('husk-concat'),
    require('husk-pluck'),
    require('husk-stringify')
  ]);

husk(process.stdin)
  .lines({buffer: true})
  .each()
  .split()
  .object({schema: {user: 0, line: 1, when: -2}})
  .concat()
  .pluck(0)
  .stringify({indent: 2})
  .print()
  .run();
```

**Result**.

```
undefined
{
  "user": "muji",
  "line": ":0",
  "when": "2016-01-27 11:32 (:0)"
}
```

### stream-events

Bypass chained method calls and listen on streams.

```
ebin/stream-events
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..').exec()
  , exec = require('husk-exec')
  , each = require('husk-each')
  , print = require('husk-print')
  , concat = require('husk-concat')
  , buffer =  require('husk-buffer')
  , lines = require('husk-lines')
  , filter = require('husk-filter')
  , transform = require('husk-transform')
  , stringify = require('husk-stringify');

function onEnd() {
  console.log('' + this);
}

var h = husk();
h
  .pipe(exec('find', ['lib']))
    .on('end', onEnd)
  .pipe(buffer())
    .on('end', onEnd)
  .pipe(lines())
    .on('end', onEnd)
  .pipe(each())
    .on('end', onEnd)
  .pipe(filter(function(){return /\.md$/.test(this)}))
    .on('end', onEnd)
  .pipe(transform(function(){return [this]}))
    .on('end', onEnd)
  .pipe(concat())
    .on('end', onEnd)
  .pipe(stringify({indent: 2}))
    .on('end', onEnd)
  .pipe(print(function noop(){}));

h.run(onEnd);
```

**Result**.

```
[Process:Transform]
[Buffer:PassThrough]
[Line:Transform]
[Each:Transform]
[Filter:Transform]
[Transform:Transform]
undefined
[Concat:Transform]
[Stringify:Transform]
[Print:Transform] noop
```

### transform

Find files, filter and transform to a json array.

```
ebin/transform
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..').exec()
  .plugin([
    require('husk-concat'),
    require('husk-lines'),
    require('husk-each'),
    require('husk-filter'),
    require('husk-transform'),
    require('husk-stringify')
  ]);
husk()
  .cd('lib')
  .find()
  .lines({buffer: true})
  .each()
  .filter(function(){return /\/[a].*\/.*\.md$/.test(this)})
  .transform(function(){return [this]})
  .concat()
  .stringify({indent: 2})
  .print()
  .run();
```

**Result**.

```
undefined
[
  "./stream/argv/README.md",
  "./stream/async/README.md",
  "./stream/assert/README.md",
  "./plugin/argv/README.md",
  "./plugin/async/README.md",
  "./plugin/assert/README.md"
]
```

### url

Parse URL arguments.

```
ebin/url https://example.com:443/?var=foo
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..')
  .plugin([
    require('husk-argv'),
    require('husk-pluck'),
    require('husk-each'),
    require('husk-url'),
    require('husk-pluck'),
    require('husk-concat'),
    require('husk-stringify'),
  ]);

husk(process.argv.slice(2))
  .argv()
  .pluck(function(){return this.unparsed})
  .each()
  .url({qs: true})
  .pluck(function(){return this.query})
  .concat()
  .stringify({indent: 2})
  .print()
  .run();
```

**Result**.

```
undefined
[
  {
    "var": "foo"
  }
]
```

### zlib

Compress files and print compressed ratio.

```
ebin/zlib
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..').exec().fs()
  .plugin([
    require('husk-concat'),
    require('husk-lines'),
    require('husk-each'),
    require('husk-reject'),
    require('husk-zlib'),
    require('husk-pluck'),
    require('husk-stringify'),
  ])
  , zlib = husk.zlib;

husk()
  .find('lib/plugin/exec', '-name', '*.js')
  .lines()
  .each()
  .reject(function(){return this.valueOf() === ''})
  .read({buffer: false})
  .stat(function(){return [this.path]})
  .through(function(){
    this.dest = this.path + '.gz';
    this.orig = this.stat;
  })
  .zlib(zlib.gzip())
  .write()
  .stat(function(){return [this.dest]})
  .pluck(function(){
    return {
      source: this.path,
      file: this.dest,
      ratio: (this.stat.size / this.orig.size),
      percent: Math.round((this.stat.size / this.orig.size) * 100) + '%'
    }
  })
  .unlink(function() {return [this.file]})
  .concat()
  .stringify({indent: 2})
  .print()
  .run();
```

**Result**.

```
undefined
[
  {
    "source": "lib/plugin/exec/alias.js",
    "file": "lib/plugin/exec/alias.js.gz",
    "ratio": 0.3165910563836682,
    "percent": "32%"
  },
  {
    "source": "lib/plugin/exec/index.js",
    "file": "lib/plugin/exec/index.js.gz",
    "ratio": 0.3460193652501345,
    "percent": "35%"
  }
]
```

## Developer

Whilst the design is modular the repository is monolithic to reduce maintenance, all the modules in [plugin](https://github.com/tmpfs/husk/blob/master/lib/plugin) and [stream](https://github.com/tmpfs/husk/blob/master/lib/stream) should be linked and it is easiest to resolve all dependencies at the top-level during development.

To get up and running:

```
npm i -dd && npm run ln
```

### Install

Runs `npm install` on all modules:

```
npm run installify
```

### Link

Runs `npm link` on all modules:

```
npm run linkify
```

### Example

To view the output from all examples in [ebin](https://github.com/tmpfs/husk/blob/master/ebin) (also included in the readme build):

```
sbin/ebin
```

### Test

Tests are not included in the package, clone the repository:

```
npm test
```

### Cover

To generate code coverage run:

```
npm run cover
```

### Documentation

To generate all documentation:

```
npm run docs
```

### Readme

To build the readme file from the partial definitions (requires [mdp](https://github.com/tmpfs/mdp)):

```
npm run readme
```

## License

Everything is [MIT](http://en.wikipedia.org/wiki/MIT_License). Read the [license](https://github.com/tmpfs/husk/blob/master/LICENSE) if you feel inclined.

Generated by [mdp(1)](https://github.com/tmpfs/mdp).

[node]: http://nodejs.org
[npm]: http://www.npmjs.org
[mdp]: https://github.com/tmpfs/mdp
[zephyr]: https://github.com/tmpfs/zephyr
[zephyr-plugins]: https://github.com/tmpfs/zephyr#plugins
