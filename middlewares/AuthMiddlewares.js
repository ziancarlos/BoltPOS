const jwt = require("jsonwebtoken");
const { User, Profile } = require("../models");
const SECRET_KEY = process.env.SECRET_KEY;

module.exports = async function AuthMiddleware(req, res, next) {
  try {
    const { accessToken } = req.session;

    // If no access token, redirect to login
    if (!accessToken) {
      return res.redirect("/login?error=Please login first");
    }

    // Verify token
    let payload;
    try {
      payload = jwt.verify(accessToken, SECRET_KEY);
    } catch (e) {
      // Clear invalid token
      delete req.session.accessToken;
      return res.redirect("/login?error=Session expired, please login again");
    }

    // Check user exists
    const user = await User.findOne({
      where: {
        userId: payload.userId,
      },
      include: {
        model: Profile,
        as: "profile",
        required: false,
      },
    });
    if (!user) {
      delete req.session.accessToken;
      return res.redirect("/login?error=User not found");
    }

    // Attach user to request
    req.user = {
      userId: user.userId,
      role: user.role,
      username: user.username,
      fullName: user?.profile?.fullName
        ? user?.profile?.fullName
        : user.username,
    };

    next();
  } catch (e) {
    console.log(e);
    return res.redirect(`/login?error=Authentication error`);
  }
};
