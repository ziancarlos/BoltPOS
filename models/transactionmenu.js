"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TransactionMenu extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    getSubtotal() {
      return this.price * this.quantity;
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
        },
      },
      notes: {
        type: DataTypes.TEXT,
        validate: {
          len: {
            args: [0, 500],
            msg: "Catatan tidak boleh lebih dari 500 karakter",
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
