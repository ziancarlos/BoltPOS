const { setErrorAlert } = require("../helpers/helper.js");
const AlertError = require("../errors/AlertError.js");
const SwalError = require("../errors/SwalError.js");

function ErrorMiddleware(err, req, res, next) {
  if (!err) {
    next();
    return;
  }

  console.log(err);

  if (err instanceof AlertError) {
    const messages = JSON.stringify(
      err.messages.map(({ message }) => ({ message }))
    );

    return res.redirect(
      err.redirect + `?errors=${encodeURIComponent(messages)}`
    );
  } else if (err instanceof SwalError) {
    setErrorAlert(req, err.msg);

    return res.redirect(err.redirect);
  }

  return res.redirect("/500");
}

module.exports = ErrorMiddleware;
