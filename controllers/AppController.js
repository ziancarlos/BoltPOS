// AppController.js
const { Op } = require("sequelize");
const { User, Category, Menu, Transaction } = require("../models"); // Adjust models path as needed
const moment = require("moment"); // Add moment.js for date handling
const { receiveSuccessAlert, receiveErrorAlert } = require("../helpers/helper");

class AppController {
  static async showDashboard(req, res, next) {
    try {
      const { username, role, userId, fullName } = req.user;
      const currentPath = req.path;
      const successMessage = receiveSuccessAlert(req);
      const errorMessage = receiveErrorAlert(req);

      // Get current date range
      const todayStart = moment().startOf("day").toDate();
      const todayEnd = moment().endOf("day").toDate();
      const monthStart = moment().startOf("month").toDate();
      const monthEnd = moment().endOf("month").toDate();

      // Get all counts and sums in parallel
      const [
        userCount,
        categoryCount,
        menuCount,
        transactionCount,
        todayRevenue,
        monthlyRevenue,
      ] = await Promise.all([
        User.count(),
        Category.count(),
        Menu.count(),
        Transaction.count({ where: { status: { [Op.not]: "DIBATALKAN" } } }),
        Transaction.sum("total", {
          where: {
            status: "SELESAI",
            createdAt: { [Op.between]: [todayStart, todayEnd] },
          },
        }),
        Transaction.sum("total", {
          where: {
            status: "SELESAI",
            createdAt: { [Op.between]: [monthStart, monthEnd] },
          },
        }),
      ]);

      res.render("Dashboard", {
        user: {
          userId,
          username,
          role,
          fullName,
        },
        successMessage,
        errorMessage,

        currentPath,
        counts: {
          users: userCount,
          categories: categoryCount,
          menus: menuCount,
          transactions: transactionCount,
          todayRevenue: todayRevenue || 0, // Default to 0 if null
          monthlyRevenue: monthlyRevenue || 0, // Default to 0 if null
        },
      });
    } catch (e) {
      next(e);
    }
  }
}

module.exports = AppController;
