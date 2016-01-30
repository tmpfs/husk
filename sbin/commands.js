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
  'modify-file': {
    cmd: 'ebin/modify-file',
    description: 'Read, parse, modify and write out file.'
  },
  fs: {
    cmd: 'ebin/fs',
    description: 'Open fd, write close and print file content.'
  },
  url: {
    cmd: 'ebin/url https://example.com:443/?var=foo',
    description: 'Parse URL arguments.'
  },
  zlib: {
    cmd: 'ebin/zlib',
    description: 'Compress files and print compressed ratio.'
  },
  prompt: {
    spawn: true,
    cmd: 'ebin/prompt',
    description: 'Prompt for user input.'
  },
  hash: {
    cmd: 'ebin/hash',
    description: 'Stream multiple files to multiple hash checksums.'
  },
  filter: {
    cmd: 'ebin/filter',
    description: 'Filter array of lines with accept function'
  },
  push: {
    cmd: 'ebin/push',
    description: 'Push multiple chunks'
  },
  reject: {
    cmd: 'ebin/reject',
    description: 'Filter array of lines with reject function'
  },
  parallel: {
    cmd: 'ebin/parallel',
    description: 'Execute commands in parallel'
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
  }
}
