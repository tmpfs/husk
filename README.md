Table of Contents
=================

* [Husk](#husk)
  * [Install](#install)
  * [Example](#example)
    * [exec](#exec)
      * [Source](#source)
      * [Result](#result)
    * [filter](#filter)
      * [Source](#source-1)
      * [Result](#result-1)
    * [pluck](#pluck)
      * [Source](#source-2)
      * [Result](#result-2)
    * [series](#series)
      * [Source](#source-3)
      * [Result](#result-3)
    * [stdin](#stdin)
      * [Source](#source-4)
      * [Result](#result-4)
    * [transform](#transform)
      * [Source](#source-5)
      * [Result](#result-5)
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

### exec

Execute an external command with callback.

```
ebin/exec
```

#### Source

```javascript
#!/usr/bin/env node

var husk = require('..').core().exec();

husk()
  .whoami(console.log.bind(null, '[code: %s, signal: %s]'))
  .print().run();
```

#### Result

```
cyberfunk
[code: 0, signal: null]
```

### filter

Filter array of lines with custom function.

```
ebin/filter
```

#### Source

```javascript
#!/usr/bin/env node

var husk = require('..').core().exec()
  .plugin([
    require('husk-lines'),
    require('husk-buffer'),
    require('husk-filter'),
    require('husk-split'),
    require('husk-object'),
    require('husk-stringify')
  ]);

husk()
  .ps('ax')
  .lines()
  //.buffer()
  .filter(function(){return this.trim().indexOf(process.pid) === 0})
  .split()
  .object({schema: {pid: 0, tt: 1, stat: 2, time: 3, cmd: -4}})
  .stringify({indent: 2})
  .print().run();
```

#### Result

```
{
  "pid": "32206",
  "tt": "s026",
  "stat": "R+",
  "time": "0:00.12",
  "cmd": "node ebin/filter"
}
```

### pluck

Read json from filesystem and pluck field.

```
ebin/pluck
```

#### Source

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
  .pluck('dependencies')
  //.pluck(function(){return this.dependencies})
  .stringify({indent: 2})
  //.write('dependencies.json')
  .print()
  .run();
```

#### Result

```
{
  "husk-core": "~1.0.0",
  "husk-exec": "~1.0.0",
  "zephyr": "~1.2.5"
}
```

### series

Execute commands in series.

```
ebin/series
```

#### Source

```javascript
#!/usr/bin/env node

var husk = require('..').core().exec();

husk()
  .echo(1, 2, 3)
  .sleep(1)
  .echo('foo', 'bar')
  .print().run();
```

#### Result

```
1 2 3
foo bar
```

### stdin

Pipe stdin to various plugins to produce json.

```
who | ebin/stdin
```

#### Source

```javascript
#!/usr/bin/env node

var husk = require('..').core()
  .plugin([
    require('husk-lines'),
    require('husk-split'),
    require('husk-object'),
    require('husk-pluck'),
    require('husk-stringify')
  ]);

husk()
  .stdin()
  .lines()
  .split()
  .object({schema: {user: 0, line: 1, when: -2}})
  .pluck(0)
  .stringify({indent: 2})
  .print().run();
```

#### Result

```
{
  "user": "cyberfunk",
  "line": "console",
  "when": "Mar 17 15:40 "
}
```

### transform

Find files, filter and transform to a json array.

```
who | ebin/transform
```

#### Source

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
  .print().run();
```

#### Result

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
