module.exports = {
  argv: {
    cmd: 'ebin/argv index.js package.json',
    description: 'Extract values from program arguments'
  },
  async: {
    cmd: 'ebin/async',
    description: 'Pass data to async functions'
  },
  'data-write': {
    cmd: 'ebin/data-write',
    description: 'Pass data to be written on run'
  },
  'stream-events': {
    cmd: 'ebin/stream-events',
    description: 'Bypass chained method calls and listen on streams'
  },
  'plugin-events': {
    cmd: 'ebin/plugin-events',
    description: 'Listen on streams using plugin chain'
  },
  filter: {
    cmd: 'ebin/filter',
    description: 'Filter array of lines with custom function'
  },
  series: {
    cmd: 'ebin/series',
    description: 'Execute commands in series'
  },
  pluck: {
    cmd: 'ebin/pluck',
    description: 'Read json from filesystem and pluck field'
  },
  'process-pipe': {
    cmd: 'ebin/process-pipe',
    description: 'Pipe stdout of a command to the stdin of the next command'
  },
  exec: {
    cmd: 'ebin/exec',
    description: 'Execute an external command with callback and listener'
  },
  transform: {
    cmd: 'ebin/transform',
    description: 'Find files, filter and transform to a json array'
  },
  stdin: {
    cmd: 'who | ebin/stdin',
    description: 'Pipe stdin to various plugins to produce json'
  },
}
