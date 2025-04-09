class SwalError extends Error {
  constructor(msg, redirect) {
    super("SwalError");
    this.msg = msg;
    this.redirect = redirect;
  }
}

module.exports = SwalError;
