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
    const encodedMessages = encodeURIComponent(
      JSON.stringify(
        err.messages.map(({ message }) => ({
          message: message || "Unknown error",
        }))
      )
    );

    return res.redirect(
      err.redirect + `?errors=${encodeURIComponent(encodedMessages)}`
    );
  } else if (err instanceof SwalError) {
    setErrorAlert(req, err.msg);

    return res.redirect(err.redirect);
  }

  return res.redirect("/500");
}

module.exports = ErrorMiddleware;
