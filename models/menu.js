// Model File (menu.js)
"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Menu extends Model {
    static associate(models) {
      Menu.belongsTo(models.Category, {
        foreignKey: "categoryId",
        as: "category",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });

      Menu.hasMany(models.TransactionMenu, {
        foreignKey: "menuId",
        as: "transactionMenus",
      });
    }
  }

  Menu.init(
    {
      menuId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        validate: {
          isInt: {
            msg: "Menu ID must be an integer",
          },
        },
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: {
            msg: "ID kategori harus berupa angka bulat",
          },
          notEmpty: {
            msg: "Kategori tidak boleh kosong",
          },
        },
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: {
          msg: "Nama menu sudah terdaftar",
        },
        validate: {
          notEmpty: {
            msg: "Nama menu tidak boleh kosong",
          },
          len: {
            args: [3, 100],
            msg: "Nama menu harus 3-100 karakter",
          },
          is: {
            args: /^[a-zA-Z0-9\s&'-]+$/i,
            msg: "Nama menu hanya boleh mengandung huruf, angka, spasi, &, ', dan -",
          },
        },
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          isDecimal: {
            msg: "Harga harus berupa angka desimal",
          },
          min: {
            args: [0.01],
            msg: "Harga minimal Rp 0.01",
          },
          max: {
            args: [10000000],
            msg: "Harga maksimal Rp 10.000.000",
          },
        },
      },
      imageFile: {
        type: DataTypes.STRING(255),
        validate: {
          notEmpty: {
            msg: "File gambar tidak boleh kosong",
          },
          is: {
            args: /\.(jpg|jpeg|png|webp)$/i,
            msg: "Format file harus JPG, JPEG, PNG, atau WEBP",
          },
        },
      },
      isAvailable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        validate: {
          isBoolean: {
            msg: "Status ketersediaan harus true/false",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Menu",
      tableName: "Menus",
      timestamps: true,
      underscored: false,
      defaultScope: {
        where: { isAvailable: true },
      },
      hooks: {
        beforeValidate: (menu) => {
          if (menu.name) {
            // Capitalize each word
            menu.name = menu.name
              .toLowerCase()
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");
          }
        },
      },
    }
  );

  return Menu;
};
