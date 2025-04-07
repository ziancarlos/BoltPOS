// Model File (category.js)
"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.hasMany(models.Menu, {
        foreignKey: "menuId",
        as: "menus",
        onDelete: "RESTRICT", // Prevent delete if menu items exist
        onUpdate: "CASCADE",
      });
    }
  }

  Category.init(
    {
      categoryId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        validate: {
          isInt: {
            msg: "Category ID must be an integer", // ID kategori harus berupa angka
          },
        },
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: {
          msg: "Category name already exists", // Nama kategori sudah digunakan
        },
        validate: {
          notEmpty: {
            msg: "Category name cannot be empty", // Nama kategori tidak boleh kosong
          },
          len: {
            args: [3, 50],
            msg: "Category name must be 3-50 characters", // Nama kategori harus 3-50 karakter
          },
          is: {
            args: /^[a-zA-Z0-9\s&-]+$/i,
            msg: "Category name can only contain letters, numbers, spaces, & and -", // Hanya boleh huruf, angka, spasi, & dan -
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Category",
      tableName: "Categories",
      timestamps: true,
      underscored: false,
      hooks: {
        beforeValidate: (category) => {
          if (category.name) {
            category.name = category.name
              .toLowerCase()
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");
          }
        },
      },
    }
  );

  return Category;
};
