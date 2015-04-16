Table of Contents
=================

* [Husk](#husk)
  * [Install](#install)
  * [Example](#example)
    * [echo](#echo)
      * [Source](#source)
      * [Result](#result)
    * [file](#file)
      * [Source](#source-1)
    * [lscat](#lscat)
      * [Source](#source-2)
      * [Result](#result-1)
    * [who](#who)
      * [Source](#source-3)
      * [Result](#result-2)
    * [whoami](#whoami)
      * [Source](#source-4)
      * [Result](#result-3)
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

### echo

Execute commands in series.

```
ebin/echo
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

### file

Read and write to filesystem.

```
ebin/file
```

#### Source

```javascript
#!/usr/bin/env node

var husk = require('..').core()
  .plugin([
    require('husk-fs'),
    require('husk-buffer'),
    require('husk-parse'),
    require('husk-stringify'),
  ]);

husk()
  .read('package.json')
  .buffer()
  .parse()
  .stringify({indent: 2})
  .write('dependencies.json')
  .run();
```

### lscat

Pipe stdout of a command to the stdin of the next command.

```
ebin/lscat
```

#### Source

```javascript
#!/usr/bin/env node

var husk = require('..').core().exec();

husk()
  .ls()
  // pipe `ls` stdout to `cat` stdin
  .pipe(1)
  .cat(console.log.bind(null, '[code: %s, signal: %s]'))
  .print().run();
```

#### Result

```
README.md
dependencies.json
doc
ebin
index.js
lib
node_modules
package.json
sbin
test
[code: 0, signal: null]
```

### who

Pipe stdin to various plugins to produce json.

```
who | ebin/who
```

#### Source

```javascript
#!/usr/bin/env node

var husk = require('..').core()
  .plugin([
    require('husk-lines'),
    require('husk-split'),
    require('husk-object'),
    require('husk-stringify')
  ]);

husk()
  .stdin()
  .lines()
  .split()
  .object({schema: {user: 0, line: 1, when: -2}})
  .stringify({indent: 2})
  .print().run();
```

#### Result

```
[
  {
    "user": "cyberfunk",
    "line": "console",
    "when": "Mar 17 15:40 "
  },
  {
    "user": "cyberfunk",
    "line": "ttys000",
    "when": "Apr 11 15:31 "
  }
]
```

### whoami

Execute an external command with callback.

```
ebin/whoami
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
