"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Transactions", {
      transactionId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "userId",
        },

        onDelete: "cascade",
        onUpdate: "cascade",
      },
      total: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      paymentMethod: {
        type: Sequelize.ENUM(
          "Cash",
          "QRIS",
          "Kartu Kredit",
          "Kartu Debit",
          "Transfer"
        ),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("PENDING", "PROSES", "SELESAI", "DIBATALKAN"),
        allowNull: false,
        defaultValue: "PENDING",
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Transactions");
  },
};
