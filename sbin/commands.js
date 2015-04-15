module.exports = {
  lscat: {
    cmd: 'ebin/lscat',
    description: 'Pipe stdout of a command to the stdin of the next command'
  },
  pwd: {
    cmd: 'ebin/pwd',
    description: 'Execute a command'
  },
  sleep: {
    cmd: 'ebin/sleep',
    description: 'Sleep for a bit'
  },
  who: {
    cmd: 'who | ebin/who',
    description: 'Pipe stdin to various plugins to produce json'
  },
}
