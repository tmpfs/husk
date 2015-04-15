module.exports = function plugin() {
  this.stdin = function stdin() {
    //this._stdin = true;
    this.once('run', function onRun(ps, cmd, args, opts) {
      // already running or no valid command
      //if(this.ps || !cmd) {
        if(!cmd) {
          process.stdin.pipe(this);
          //this._stdin = false;
        }
        //return false;
      //}
    })
    return this;
  }
}
