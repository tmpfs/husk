Table of Contents
=================

* [Husk](#husk)
  * [Install](#install)
  * [Example](#example)
    * [data-write](#data-write)
    * [exec](#exec)
    * [filter](#filter)
    * [pluck](#pluck)
    * [process-pipe](#process-pipe)
    * [series](#series)
    * [stdin](#stdin)
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

## Example

### data-write

Pass data to be written on run.

```
ebin/data-write
```

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

```
{
  "editor": "vim"
}
```

### exec

Execute an external command with callback.

```
ebin/exec
```

```javascript
#!/usr/bin/env node

var husk = require('..').core().exec();

husk()
  .whoami(console.log.bind(null, '[code: %s, signal: %s]'))
  .print().run();
```

```
cyberfunk
[code: 0, signal: null]
```

### filter

Filter array of lines with custom function.

```
ebin/filter
```

```javascript
#!/usr/bin/env node

var husk = require('..').core().exec()
  .plugin([
    require('husk-lines'),
    require('husk-filter'),
    require('husk-split'),
    require('husk-object'),
    require('husk-stringify')
  ]);

husk()
  .ps('ax')
  .lines()
  .filter(function(){return this.trim().indexOf(process.pid) === 0})
  .split()
  .object({schema: {pid: 0, tt: 1, stat: 2, time: 3, cmd: -4}})
  .stringify({indent: 2})
  .print().run();
```

```
{
  "pid": "52898",
  "tt": "s026",
  "stat": "R+",
  "time": "0:00.11",
  "cmd": "node ebin/filter"
}
```

### pluck

Read json from filesystem and pluck field.

```
ebin/pluck
```

```javascript
#!/usr/bin/env node

var husk = require('..').core()
  .plugin([
    require('husk-fs'),
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

```
{
  "husk-core": "~1.0.0",
  "husk-exec": "~1.0.0",
  "zephyr": "~1.2.5"
}
```

### process-pipe

Pipe stdout of a command to the stdin of the next command.

```
ebin/process-pipe
```

```javascript
#!/usr/bin/env node

var husk = require('..').core().exec();

husk()
  .ls('lib')
  // pipe `ls` stdout to `cat` stdin
  .pipe(1)
  .cat()
  .print().run();
```

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

```javascript
#!/usr/bin/env node

var husk = require('..').core().exec();

husk()
  .echo(1, 2, 3)
  .sleep(1)
  .echo('foo', 'bar')
  .print().run();
```

```
1 2 3
foo bar
```

### stdin

Pipe stdin to various plugins to produce json.

```
who | ebin/stdin
```

```javascript
#!/usr/bin/env node

var husk = require('..').core()
  .plugin([
    require('husk-buffer'),
    require('husk-lines'),
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
  .transform(function(){return [this.trim()]})
  .split()
  .object({schema: {user: 0, line: 1, when: -2}})
  .concat()
  .pluck(0)
  .stringify({indent: 2})
  .print().run();
```

```
{
  "user": "cyberfunk",
  "line": "console",
  "when": "Mar 17 15:40"
}
```

### transform

Find files, filter and transform to a json array.

```
who | ebin/transform
```

```javascript
#!/usr/bin/env node

var husk = require('..').core().exec()
  .plugin([
    require('husk-concat'),
    require('husk-buffer'),
    require('husk-lines'),
    require('husk-filter'),
    require('husk-transform'),
    require('husk-stringify')
  ]);

husk()
  .cd('lib')
  .find()
  .buffer()
  .lines()
  .filter(function(){return /\.md$/.test(this)})
  .transform(function(){return [this]})
  .concat()
  .stringify({indent: 2})
  .print()
  .run();
```

```
[
  "./plugin/buffer/README.md",
  "./plugin/concat/README.md",
  "./plugin/core/README.md",
  "./plugin/exec/README.md",
  "./plugin/filter/README.md",
  "./plugin/fs/README.md",
  "./plugin/lines/README.md",
  "./plugin/object/README.md",
  "./plugin/parse/README.md",
  "./plugin/pluck/README.md",
  "./plugin/split/README.md",
  "./plugin/stringify/README.md",
  "./plugin/transform/README.md",
  "./stream/buffer/README.md",
  "./stream/concat/README.md",
  "./stream/method/README.md",
  "./stream/print/README.md",
  "./stream/process/README.md"
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
