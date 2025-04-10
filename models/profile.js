// Model File (profile.js)
"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Profile extends Model {
    static associate(models) {
      Profile.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }

  Profile.init(
    {
      profileId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        validate: {
          isInt: {
            msg: "ID profil harus berupa angka",
          },
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: {
          msg: "Setiap user hanya boleh memiliki satu profil",
        },
        validate: {
          isInt: {
            msg: "ID user harus berupa angka",
          },
        },
      },
      fullName: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
          len: {
            args: [4, 100],
            msg: "Nama lengkap harus terdiri dari 4-100 karakter",
          },
          is: {
            args: /^[a-zA-Z\s.,']+$/i,
            msg: "Nama lengkap hanya boleh mengandung huruf dan spasi",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Profile",
      tableName: "Profiles",
      timestamps: true,
      underscored: false,
      hooks: {
        beforeValidate: (profile) => {
          if (profile.fullName) {
            // Format nama: Kapital di setiap kata
            profile.fullName = profile.fullName
              .toLowerCase()
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");
          }
        },
      },
    }
  );

  return Profile;
};
