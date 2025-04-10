const { sequelize, TransactionMenu, Menu, Transaction } = require("../models");
class ReportController {
  static async getMenuSalesReport(req, res, next) {
    try {
      const { username, role, userId, fullName } = req.user;
      const currentPath = req.path;
      const { startDate, endDate } = req.query;

      const menuSales = await TransactionMenu.findAll({
        attributes: [
          "menuId",
          [sequelize.fn("SUM", sequelize.col("quantity")), "totalQuantity"],
          [
            sequelize.fn("SUM", sequelize.col("TransactionMenu.price")),
            "totalRevenue",
          ],
        ],
        include: [
          {
            model: Menu,
            as: "menu",
            attributes: ["name"],
          },
          {
            model: Transaction,
            as: "transaction",
            where: {
              status: "SELESAI",
            },
            attributes: [],
          },
        ],
        group: ["menu.menuId", "TransactionMenu.menuId"],
      });

      res.render("report/MenuSalesReport", {
        user: {
          userId,
          username,
          role,
          fullName,
        },
        currentPath,

        menuSales,
        startDate: startDate || "",
        endDate: endDate || "",
        user: req.user,
      });
    } catch (e) {
      next(e);
    }
  }
}

module.exports = ReportController;
