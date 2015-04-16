module.exports = {
  series: {
    cmd: 'ebin/series',
    description: 'Execute commands in series'
  },
  pluck: {
    cmd: 'ebin/pluck',
    description: 'Read json from filesystem and pluck field'
  },
  pipe: {
    cmd: 'ebin/process-pipe',
    description: 'Pipe stdout of a command to the stdin of the next command'
  },
  exec: {
    cmd: 'ebin/exec',
    description: 'Execute an external command with callback'
  },
  stdin: {
    cmd: 'who | ebin/stdin',
    description: 'Pipe stdin to various plugins to produce json'
  },
}
