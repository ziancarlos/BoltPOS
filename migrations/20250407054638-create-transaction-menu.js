"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("TransactionMenus", {
      transactionMenuId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      transactionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Transactions",
          key: "transactionId",
        },

        onDelete: "cascade",
        onUpdate: "cascade",
      },
      menuId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Menus",
          key: "menuId",
        },

        onDelete: "cascade",
        onUpdate: "cascade",
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      price: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        validate: {
          min: 1,
        },
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
    await queryInterface.dropTable("TransactionMenus");
  },
};
