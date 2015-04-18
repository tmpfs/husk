Table of Contents
=================

* [Husk](#husk)
  * [Install](#install)
  * [Examples](#examples)
    * [async](#async)
    * [data-write](#data-write)
    * [exec](#exec)
    * [filter](#filter)
    * [pluck](#pluck)
    * [process-pipe](#process-pipe)
    * [series](#series)
    * [stdin](#stdin)
    * [stream-events](#stream-events)
    * [transform](#transform)
  * [Developer](#developer)
    * [Test](#test)
    * [Cover](#cover)
    * [Documentation](#documentation)
    * [Readme](#readme)
  * [License](#license)

Husk
====

Command execution as transform streams.

Requires [node](http://nodejs.org) and [npm](http://www.npmjs.org).

## Install

```
npm i husk --save
```

## Examples

### async

Pass data to async functions.

```
ebin/async
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..').core().exec()
  .plugin([
    require('husk-async'),
    require('husk-pluck')
  ]);

function timer(cb) {
  var chunk = this;
  function callback() {
    var s = ('' + chunk).trim().split('').reverse().join('') + '\n';
    cb(s);
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

var husk = require('..').core()
  .plugin([
    require('husk-pluck'),
    require('husk-transform'),
    require('husk-stringify')
  ]);

husk(process.env)
  .pluck(function(){return this.EDITOR})
  .transform(function(){return {editor: this}})
  .stringify({indent: 2})
  .print()
  .run();
```

**Result**.

```
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

var husk = require('..').core().exec();

husk()
  .whoami(console.log.bind(null, '[code: %s, signal: %s]'))
    .once('end', console.log.bind(null, '[end] whoami'))
  .print()
  .run();
```

**Result**.

```
cyberfunk
[code: 0, signal: null]
[end] whoami
```

### filter

Filter array of lines with custom function.

```
ebin/filter
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..').core().exec()
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
  .lines()
  .each()
  .filter(function(){return parseInt(this.split(/\s+/)[0]) === process.pid})
  .split()
  .object({schema: {pid: 0, tt: 1, stat: 2, time: 3, cmd: -4}})
  .stringify({indent: 2})
  .print()
  .run();
```

**Result**.

```
{
  "pid": "35266",
  "tt": "s002",
  "stat": "R+",
  "time": "0:00.14",
  "cmd": "node ebin/filter"
}
```

### pluck

Read json from filesystem and pluck field.

```
ebin/pluck
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..').core().fs()
  .plugin([
    require('husk-buffer'),
    require('husk-parse'),
    require('husk-pluck'),
    require('husk-stringify'),
  ]);

husk()
  .read('package.json')
  .buffer()
  .parse()
  .pluck(function(){return this.dependencies})
  .stringify({indent: 2})
  .print()
  .run();
```

**Result**.

```
{
  "husk-core": "~1.0.1",
  "husk-exec": "~1.0.1",
  "husk-print": "~1.0.1",
  "zephyr": "~1.2.6"
}
```

### process-pipe

Pipe stdout of a command to the stdin of the next command.

```
ebin/process-pipe
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..').core().exec();

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

### series

Execute commands in series.

```
ebin/series
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..').core().exec();

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

var husk = require('..').core()
  .plugin([
    require('husk-buffer'),
    require('husk-lines'),
    require('husk-each'),
    require('husk-transform'),
    require('husk-split'),
    require('husk-object'),
    require('husk-concat'),
    require('husk-pluck'),
    require('husk-stringify')
  ]);

husk()
  .stdin()
  .buffer()
  .lines()
  .each()
  .transform(function(){return [this.trim()]})
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
{
  "user": "cyberfunk",
  "line": "console",
  "when": "Jan 1 10:20"
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

var husk = require('..').core()
  , exec = require('husk-exec')
  , print = require('husk-print')
  , concat = require('husk-concat')
  , buffer =  require('husk-buffer')
  , lines = require('husk-lines')
  , filter = require('husk-filter')
  , transform = require('husk-transform')
  , stringify = require('husk-stringify');

function onEnd(phase) {
  console.log('[end] %s', phase);
}

var h = husk();
h
  .pipe(exec('find', ['lib']))
    .on('end', onEnd.bind(null, 'find'))
  .pipe(buffer())
    .on('end', onEnd.bind(null, 'buffer'))
  .pipe(lines())
    .on('end', onEnd.bind(null, 'lines'))
  .pipe(filter(function(){return /\.md$/.test(this)}))
    .on('end', onEnd.bind(null, 'filter'))
  .pipe(transform(function(){return [this]}))
    .on('end', onEnd.bind(null, 'transform'))
  .pipe(concat())
    .on('end', onEnd.bind(null, 'concat'))
  .pipe(stringify({indent: 2}))
    .on('end', onEnd.bind(null, 'stringify'))
  .pipe(print(function noop(){}))
    .on('finish', onEnd.bind(null, 'print'));

h.run();
```

**Result**.

```
[end] find
[end] buffer
[end] lines
[end] filter
[end] transform
[end] concat
[end] stringify
[end] print
```

### transform

Find files, filter and transform to a json array.

```
ebin/transform
```

**Source**.

```javascript
#!/usr/bin/env node

var husk = require('..').core().exec()
  .plugin([
    require('husk-concat'),
    require('husk-buffer'),
    require('husk-lines'),
    require('husk-each'),
    require('husk-filter'),
    require('husk-transform'),
    require('husk-stringify')
  ]);

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
  .print()
  .run();
```

**Result**.

```
[
  "./plugin/async/README.md",
  "./plugin/buffer/README.md",
  "./plugin/concat/README.md",
  "./plugin/core/README.md",
  "./plugin/each/README.md",
  "./plugin/exec/README.md",
  "./plugin/filter/README.md",
  "./plugin/fs/README.md",
  "./plugin/lines/README.md",
  "./plugin/object/README.md",
  "./plugin/parse/README.md",
  "./plugin/pluck/README.md",
  "./plugin/print/README.md",
  "./plugin/split/README.md",
  "./plugin/stringify/README.md",
  "./plugin/transform/README.md",
  "./stream/async/README.md",
  "./stream/buffer/README.md",
  "./stream/concat/README.md",
  "./stream/each/README.md",
  "./stream/filter/README.md",
  "./stream/object/README.md",
  "./stream/parse/README.md",
  "./stream/print/README.md",
  "./stream/process/README.md",
  "./stream/stringify/README.md",
  "./stream/through3/README.md",
  "./stream/transform/README.md"
]
```

## Developer

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

To build the readme file from the partial definitions (requires [mdp](https://github.com/freeformsystems/mdp)):

```
npm run readme
```

## License

Everything is [MIT](http://en.wikipedia.org/wiki/MIT_License). Read the [license](https://github.com/freeformsystems/husk/blob/master/LICENSE) if you feel inclined.

Generated by [mdp(1)](https://github.com/freeformsystems/mdp).

[node]: http://nodejs.org
[npm]: http://www.npmjs.org
[mdp]: https://github.com/freeformsystems/mdp
