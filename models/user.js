"use strict";
const bcrypt = require("bcrypt");
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static async hashPassword(password) {
      const salt = await bcrypt.genSalt(10);
      return await bcrypt.hash(password, salt);
    }

    static isPasswordValid(password) {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      return passwordRegex.test(password);
    }

    static associate(models) {
      User.hasOne(models.Profile, {
        foreignKey: "userId",
        as: "profile",
      });
      User.hasMany(models.Transaction, {
        foreignKey: "userId",
        as: "transactions",
      });
    }
  }

  User.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        validate: {
          isInt: {
            msg: "ID user harus berupa angka",
          },
        },
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: {
          args: true,
          msg: "Username sudah digunakan",
        },
        validate: {
          len: {
            args: [3, 50],
            msg: "Username harus terdiri dari 3-50 karakter",
          },
          notEmpty: {
            msg: "Username tidak boleh kosong",
          },
          is: {
            args: /^[a-zA-Z0-9_]+$/,
            msg: "Username hanya boleh mengandung huruf, angka, dan underscore (_)",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Password tidak boleh kosong",
          },
        },
      },
      role: {
        type: DataTypes.ENUM("owner", "staff"),
        allowNull: false,
        defaultValue: "staff",
        validate: {
          isIn: {
            args: [["owner", "staff"]],
            msg: "Role harus berupa 'owner' atau 'staff'",
          },
        },
      },
      accessToken: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
          len: {
            args: [0, 500],
            msg: "Token akses tidak boleh lebih dari 500 karakter",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "Users",
      timestamps: true,
      underscored: false,
      hooks: {
        beforeCreate: async (user) => {
          console.log(user);
          if (user.password) {
            if (!User.isPasswordValid(user.password)) {
              throw new Error(
                "Password harus mengandung: " +
                  "1 huruf besar, 1 huruf kecil, 1 angka, dan 1 karakter khusus (@$!%*?&)"
              );
            }
            user.password = await User.hashPassword(user.password);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed("password")) {
            if (!User.isPasswordValid(user.password)) {
              throw new Error(
                "Password harus mengandung: " +
                  "1 huruf besar, 1 huruf kecil, 1 angka, dan 1 karakter khusus (@$!%*?&)"
              );
            }
            user.password = await User.hashPassword(user.password);
          }
        },
      },
    }
  );

  return User;
};
