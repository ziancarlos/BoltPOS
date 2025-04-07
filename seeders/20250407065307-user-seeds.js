"use strict";
const fs = require("fs").promises;
const bcrypt = require("bcrypt");
/** @type {import('sequelize-cli').Migration} */

const { User } = require("../models");
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */

    try {
      let users = JSON.parse(await fs.readFile("./data/users.json", "utf-8"));

      users = await Promise.all(
        users.map(async (user) => {
          user.password = await User.hashPassword(user.password);
          return user;
        })
      );

      await queryInterface.bulkInsert("Users", users, {});
    } catch (e) {
      console.log(e);
    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    await queryInterface.bulkDelete("Users", null, {});
  },
};
