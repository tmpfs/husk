module.exports = {
  'data-write': {
    cmd: 'ebin/data-write',
    description: 'Pass data to be written on run'
  },
  'pipe-events': {
    cmd: 'ebin/pipe-events',
    description: 'Bypass chained method calls and listen on streams'
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
    description: 'Execute an external command with callback'
  },
  transform: {
    cmd: 'who | ebin/transform',
    description: 'Find files, filter and transform to a json array'
  },
  stdin: {
    cmd: 'who | ebin/stdin',
    description: 'Pipe stdin to various plugins to produce json'
  },
}
