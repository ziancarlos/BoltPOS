"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TransactionMenu extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    get getRupiahSubtotal() {
      return `Rp ${parseInt(this.price * this.quantity).toLocaleString()}`;
    }

    get getRupiahPrice() {
      return `Rp ${parseInt(this.price).toLocaleString()}`;
    }

    static associate(models) {
      // define association here
      TransactionMenu.belongsTo(models.Transaction, {
        foreignKey: "transactionId",
        as: "transaction",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });

      TransactionMenu.belongsTo(models.Menu, {
        foreignKey: "menuId",
        as: "menu",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }
  TransactionMenu.init(
    {
      transactionMenuId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        validate: {
          isInt: {
            msg: "ID item transaksi harus berupa angka",
          },
        },
      },
      transactionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: {
            msg: "ID transaksi harus berupa angka",
          },
          notEmpty: {
            msg: "Transaksi tidak boleh kosong",
          },
        },
      },
      menuId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: {
            msg: "ID menu harus berupa angka",
          },
          notEmpty: {
            msg: "Menu tidak boleh kosong",
          },
        },
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          isInt: {
            msg: "Jumlah harus berupa angka bulat",
          },
          min: {
            args: [1],
            msg: "Jumlah minimal 1 item",
          },
          max: {
            args: [100],
            msg: "Jumlah maksimal 100 item",
          },
        },
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isDecimal: {
            msg: "Harga harus berupa angka desimal",
          },
          min: {
            args: 1,
            msg: "Harga minimal Rp 1",
          },
        },
      },
      subtotal: {
        // Virtual field
        type: DataTypes.VIRTUAL,
        get() {
          return (this.price * this.quantity).toFixed(2);
        },
      },
    },
    {
      sequelize,
      modelName: "TransactionMenu",
    }
  );
  return TransactionMenu;
};
