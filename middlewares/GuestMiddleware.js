module.exports = function GuestMiddleware(req, res, next) {
  // Check if user is authenticated
  if (req.session.accessToken) {
    // If trying to access login page while logged in
    if (req.path === "/login") {
      return res.redirect("/dashboard");
    }
  }
  next();
};
