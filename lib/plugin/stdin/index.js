module.exports = function plugin() {
  this.stdin = function stdin() {
    this.once('run', function onRun(ps, cmd, args, opts) {
      process.stdin.pipe(this);
    })
    return this;
  }
}
