class AlertError extends Error {
  constructor(messages, redirect) {
    super("AlertError");
    this.messages = messages;
    this.redirect = redirect;
  }
}

module.exports = AlertError;
