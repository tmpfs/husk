module.exports = function plugin() {
  this.stdin = function stdin() {
    this.once('run', function onRun(ps, cmd, args, opts) {
      // pipe to first child
      if(this.children.length) {
        process.stdin.pipe(this.children[0]);
      }
    })
    this.start();
    return this;
  }
}
