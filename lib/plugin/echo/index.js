module.exports = function plugin() {
  this.echo = function echo() {
    return this.exec.apply(
      this, [echo.name].concat([].slice.call(arguments)));
  }
}
