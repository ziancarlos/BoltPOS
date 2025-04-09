const bcrypt = require("bcrypt");
const { User } = require("../models");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;
class AuthController {
  static async showLogin(req, res) {
    try {
      const { error } = req.query;

      res.render("Login", { error });
    } catch (e) {
      res.redirect(`/login?error=${e}`);
    }
  }

  static async login(req, res) {
    try {
      const { username, password } = req.body;

      const targetedUser = await User.findOne({ where: { username } });

      if (!targetedUser) {
        throw {
          name: "AuthError",
          message: "User tidak ditemukkan",
        };
      }

      const result = await bcrypt.compare(password, targetedUser.password);

      if (!result) {
        throw {
          name: "AuthError",
          message: "User tidak ditemukkan",
        };
      }

      const accessToken = jwt.sign(
        { userId: targetedUser.userId, role: targetedUser.role },
        SECRET_KEY,
        {
          expiresIn: "1d",
        }
      );

      req.session.accessToken = accessToken;

      req.session.save();

      res.redirect("/dashboard");
    } catch (e) {
      if (e.name === "AuthError") {
        return res.redirect(`/login?error=${e.message}`);
      }

      return res.redirect(`/login?error=${e}`);
    }
  }
}

module.exports = AuthController;
