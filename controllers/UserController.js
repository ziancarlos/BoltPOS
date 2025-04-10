const { User, Sequelize, Profile } = require("../models");
const {
  setSuccessAlert,
  receiveSuccessAlert,
  receiveErrorAlert,
} = require("../helpers/helper");
const validate = require("../validations/validate");
const { userIdValidation } = require("../validations/UserValidation");
const SwalError = require("../errors/SwalError");
const AlertError = require("../errors/AlertError");
const { literal } = require("sequelize");
const { createValidation } = require("../validations/UserValidation");

class UserController {
  static async getAll(req, res, next) {
    const { username, role, userId, fullName } = req.user;
    const currentPath = req.path;
    const successMessage = receiveSuccessAlert(req);
    const errorMessage = receiveErrorAlert(req);

    try {
      const users = await User.findAll({
        attributes: [
          "userId",
          "username",
          "role",
          [literal(`TO_CHAR("User"."createdAt", 'YYYY-MM-DD')`), "createdDate"],
        ],
        order: [["userId", "DESC"]],
      });

      res.render("user/DataUser", {
        users,
        successMessage,
        errorMessage,
        user: { userId, username, role, fullName },
        currentPath,
      });
    } catch (e) {
      next(e);
    }
  }

  static async createForm(req, res, next) {
    const { username, role, userId, fullName } = req.user;
    const currentPath = req.path;
    let { errors } = req.query;

    if (errors) {
      try {
        errors = JSON.parse(decodeURIComponent(errors));
      } catch (e) {
        errors = [{ message: "Error parsing error messages" }];
      }
    }

    try {
      res.render("user/CreateUser", {
        user: { userId, username, role, fullName },
        currentPath,
        errors,
      });
    } catch (e) {
      next(e);
    }
  }

  static async create(req, res, next) {
    try {
      const body = req.body;

      const { username, password, role } = validate(
        createValidation,
        body,
        (message) => {
          throw new AlertError(message, "/users/add");
        }
      );

      try {
        const user = await User.create({ username, password, role });
        await Profile.create({
          userId: user.dataValues.userId,
          fullName: null,
        });
      } catch (e) {
        throw new AlertError(e.errors, "/users/add");
      }

      setSuccessAlert(req, "Berhasil menambahkan user.");
      res.redirect("/users");
    } catch (e) {
      next(e);
    }
  }

  static async updateForm(req, res, next) {
    const { username, role, userId, fullName } = req.user;
    const currentPath = req.path;
    let { errors } = req.query;

    if (errors) {
      try {
        errors = JSON.parse(decodeURIComponent(errors));
      } catch (e) {
        errors = [{ message: "Error parsing error messages" }];
      }
    }

    try {
      let { userId: targetId } = req.params;

      targetId = validate(userIdValidation, targetId, (message) => {
        throw new SwalError(message[0].message, "/users");
      });

      const targetUser = await User.findByPk(targetId);

      if (!targetUser) {
        throw new SwalError("User tidak ditemukan.", "/users");
      }

      res.render("user/UpdateUser", {
        targetUser,
        user: { userId, username, role, fullName },
        currentPath,
        errors,
      });
    } catch (e) {
      next(e);
    }
  }

  static async update(req, res, next) {
    try {
      let { userId: targetId } = req.params;
      targetId = validate(userIdValidation, targetId, (message) => {
        throw new SwalError(message[0].message, "/users");
      });

      const { username, password, role } = req.body;

      const targetUser = await User.findByPk(targetId);

      if (!targetUser) {
        throw new SwalError("User tidak ditemukan.", "/users");
      }

      if (
        targetUser.username === username &&
        (!password || password.trim() === "") &&
        targetUser.role === role
      ) {
        throw new AlertError(
          [{ message: "Tidak menemukan perubahaan apapun." }],
          `/users/${targetId}/edit`
        );
      }

      targetUser.username = username;
      if (password && password.trim() !== "") {
        targetUser.password = password;
      }
      targetUser.role = role;

      try {
        await targetUser.save();
      } catch (e) {
        throw new AlertError(e.errors, `/users/${targetId}/edit`);
      }

      setSuccessAlert(req, "Berhasil mengubah user.");
      res.redirect("/users");
    } catch (e) {
      next(e);
    }
  }

  static async updateProfileForm(req, res, next) {
    const { username, role, userId, fullName } = req.user;
    const currentPath = req.path;
    let { errors } = req.query;

    if (errors) {
      try {
        errors = JSON.parse(decodeURIComponent(errors));
      } catch (e) {
        errors = [{ message: "Error parsing error messages" }];
      }
    }

    try {
      const targetUser = await User.findOne({
        where: {
          userId,
        },
        include: {
          model: Profile,
          as: "profile",
          required: false,
        },
      });

      if (!targetUser) {
        throw new SwalError("User tidak ditemukan.", "/dashboard");
      }

      res.render("UpdateProfile", {
        targetUser,
        user: { userId, username, role, fullName },
        currentPath,
        errors,
      });
    } catch (e) {
      console.log(e);
      next(e);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      let { userId: targetId } = req.user;
      targetId = validate(userIdValidation, targetId, (message) => {
        throw new SwalError(message[0].message, "/dashboard");
      });

      const { username, password, fullName } = req.body;

      const targetUser = await User.findOne({
        where: {
          userId: targetId, // Changed from targetId to id to match the where clause
        },
        include: {
          model: Profile,
          as: "profile",
          required: false,
        },
      });

      if (!targetUser) {
        throw new SwalError("Pengguna tidak ditemukan.", "/dashboard");
      }

      // Check if there are any changes
      const noChanges =
        targetUser.username === username &&
        (!password || password.trim() === "") &&
        (!fullName ||
          fullName.trim() === "" ||
          (targetUser.profile && targetUser.profile.fullName === fullName));

      if (noChanges) {
        throw new AlertError(
          [{ message: "Tidak menemukan perubahaan apapun." }],
          `/profile`
        );
      }

      // Update user fields
      targetUser.username = username;
      if (password && password.trim() !== "") {
        targetUser.password = password;
      }

      try {
        // Save user changes
        await targetUser.save();

        if (fullName && fullName.trim() !== "") {
          if (targetUser.profile) {
            targetUser.profile.fullName = fullName;
            await targetUser.profile.save();
          } else {
            await Profile.create({
              userId: targetId,
              fullName: fullName,
            });
          }
        }
      } catch (e) {
        throw new AlertError(e.errors, `/profile`);
      }

      setSuccessAlert(req, "Berhasil mengubah profil.");
      res.redirect("/dashboard");
    } catch (e) {
      console.log(e);
      next(e);
    }
  }

  static async delete(req, res, next) {
    try {
      const { userId } = req.user;
      let { userId: targetId } = req.params;

      if (userId === targetId) {
        throw new SwalError("Tidak bisa menghapus diri sendiri.", "/users");
      }

      targetId = validate(userIdValidation, targetId, (message) => {
        throw new SwalError(message[0].message, "/users");
      });

      const targetUser = await User.findByPk(targetId);

      if (!targetUser) {
        throw new SwalError("User tidak ditemukan.", "/users");
      }

      await targetUser.destroy();

      setSuccessAlert(req, "Berhasil menghapus user.");
      res.redirect("/users");
    } catch (e) {
      next(e);
    }
  }
}

module.exports = UserController;
