module.exports = function plugin() {
  this.sleep = function sleep() {
    return this.exec.apply(
      this, [sleep.name].concat([].slice.call(arguments)));
  }
}
