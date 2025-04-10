"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    showStatus() {
      if (this.status === "SELESAI") {
        return `<span class="badge badge-success">${this.status}</span>`;
      } else if (this.status === "PROSES") {
        return `<span class="badge badge-warning text-dark">${this.status}</span>`;
      } else if (this.status === "DIBATALKAN") {
        return `<span class="badge badge-danger"> ${this.status}</span>;`;
      } else {
        return `<span class="badge badge-secondary"> ${this.status}</span>`;
      }
    }

    get getTotalRupiah() {
      return `Rp. ${parseInt(this.total).toLocaleString()}`;
    }
    static associate(models) {
      // define association here
      Transaction.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });

      Transaction.hasMany(models.TransactionMenu, {
        foreignKey: "transactionId",
        as: "menus",
      });
    }
  }
  Transaction.init(
    {
      transactionId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        validate: {
          isInt: {
            msg: "ID transaksi harus berupa angka",
          },
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: {
            msg: "ID kasir harus berupa angka",
          },
          notEmpty: {
            msg: "Kasir tidak boleh kosong",
          },
        },
      },

      customerName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          len: {
            args: [2, 100],
            msg: "Nama Kustomer lengkap harus terdiri dari 2-100 karakter",
          },
          notEmpty: {
            msg: "Nama Kustomer tidak boleh kosong",
          },
        },
      },

      total: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isDecimal: {
            msg: "Total harus berupa angka desimal",
          },
          min: {
            args: [0],
            msg: "Total tidak boleh negatif",
          },
        },
      },
      paymentMethod: {
        type: DataTypes.ENUM(
          "Cash",
          "QRIS",
          "Kartu Kredit",
          "Kartu Debit",
          "Transfer"
        ),
        allowNull: true,
        validate: {
          isIn: {
            args: [["Cash", "QRIS", "Kartu Kredit", "Kartu Debit", "Transfer"]],
            msg: "Metode pembayaran tidak valid",
          },
        },
      },

      status: {
        type: DataTypes.ENUM("PENDING", "PROSES", "SELESAI", "DIBATALKAN"),
        allowNull: false,
        defaultValue: "PENDING",
        validate: {
          isIn: {
            args: [["PENDING", "PROSES", "SELESAI", "DIBATALKAN"]],
            msg: "Status transaksi tidak valid",
          },
        },
      },

      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: {
            args: [0, 500],
            msg: "Catatan tidak boleh lebih dari 500 karakter",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Transaction",
      tableName: "Transactions",
      timestamps: true,
      underscored: false,
    }
  );
  return Transaction;
};
