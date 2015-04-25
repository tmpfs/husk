## Developer

Whilst the design is modular the repository is monolithic to reduce maintenance, all the modules in [plugin](/lib/plugin) and [stream](/lib/stream) should be linked and it is easiest to resolve all dependencies at the top-level during development.

To get up and running:

```
npm i -dd && npm run ln
```

### Link

Runs `npm link` on all modules:

```
npm run ln
```

### Example

To view the output from all examples in [ebin](/ebin) (also included in the readme build):

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

To build the readme file from the partial definitions (requires [mdp][]):

```
npm run readme
```
