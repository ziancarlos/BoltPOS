function setSuccessAlert(req, message) {
  req.session.success = message;
}
function receiveSuccessAlert(req) {
  const message = req.session.success;
  delete req.session.success;

  return message;
}

function setErrorAlert(req, message) {
  req.session.error = message;
}
function receiveErrorAlert(req) {
  const message = req.session.error;

  delete req.session.error;

  return message;
}

module.exports = {
  setSuccessAlert,
  receiveSuccessAlert,
  setErrorAlert,
  receiveErrorAlert,
};
