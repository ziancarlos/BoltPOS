const jwt = require("jsonwebtoken");
const { User } = require("../models");
const SECRET_KEY = process.env.SECRET_KEY;

module.exports = async function AuthMiddleware(req, res, next) {
  try {
    // const { accessToken } = req.session;

    // if (!accessToken) {
    //   return res.redirect("/login?error=Anda Belum Login 1.");
    // }

    // let payload;
    // try {
    //   payload = jwt.verify(accessToken, SECRET_KEY);
    // } catch (e) {
    //   return res.redirect("/login?error=Anda Belum Login 2.");
    // }

    // const user = await User.findByPk(payload.userId);
    // if (!user.username) {
    //   return res.redirect("/login?error=Anda Belum Login 3.");
    // }

    req.user = {
      userId: 1,
      role: "OWNER",
      username: "Zian",
    };
  } catch (e) {
    return res.redirect(`/login?error=${e}`);
  }

  next();
};
