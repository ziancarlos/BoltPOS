const { Op } = require("sequelize");
const { receiveSuccessAlert, receiveErrorAlert } = require("../helpers/helper");
const {
  Transaction,
  Menu,
  Category,
  TransactionMenu,
  sequelize,
  User,
} = require("../models");
const { createValidation } = require("../validations/TransactionValidation");
const validate = require("../validations/validate");
const AlertError = require("../errors/AlertError");

class TransactionController {
  static async getAll(req, res, next) {
    const { username, role, userId } = req.user;
    const currentPath = req.path;
    const successMessage = receiveSuccessAlert(req);
    const errorMessage = receiveErrorAlert(req);

    try {
      const transactions = await Transaction.findAll({
        include: [
          {
            model: User,
            as: "user",
            attributes: ["userId", "username"],
            required: false,
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      res.render("transaction/DataTransaction", {
        transactions,
        successMessage,
        errorMessage,

        user: {
          userId,
          username,
          role,
        },
        currentPath,
      });
    } catch (e) {
      next(e);
    }
  }

  static async showCreate(req, res, next) {
    const { username, role, userId } = req.user;
    const currentPath = req.path;
    let { errors } = req.query;

    if (errors) {
      try {
        errors = JSON.parse(decodeURIComponent(errors));
      } catch (e) {
        errors = [{ message: "Error parsing error messages" }];
      }
    }

    try {
      const menus = await Menu.findAll({
        where: { isAvailable: true },
        include: {
          model: Category,
          as: "category",
          attributes: ["categoryId", "name"],
        },
      });

      const categories = await Category.findAll({
        attributes: ["categoryId", "name"],

        order: [["categoryId", "DESC"]],
      });

      res.render("transaction/CreateTransaction", {
        menus,
        categories,

        user: {
          userId,
          username,
          role,
        },
        currentPath,
        errors,
      });
    } catch (e) {
      next(e);
    }
  }

  static async create(req, res, next) {
    const { username, role, userId } = req.user;

    const body = req.body;
    body.items = JSON.parse(body.items);
    delete body.dataTable_length;

    const t = await sequelize.transaction();

    try {
      const { customerName, paymentMethod, notes, items } = validate(
        createValidation,
        body,
        (message) => {
          throw new AlertError(message, "/transactions/new");
        }
      );

      const menuIds = items.map((item) => item.menuId);
      const menus = await Menu.findAll({
        where: {
          menuId: menuIds,
        },
        transaction: t,
      });

      const menuMap = new Map();
      menus.forEach((menu) => {
        menuMap.set(menu.menuId, menu);
      });

      let total = 0;
      items.forEach((item) => {
        const menu = menuMap.get(item.menuId);
        if (!menu) {
          throw new AlertError(
            `Menu with Id ${item.menuId} not found`,
            "/transactions/new"
          );
        }

        total += item.price * item.quantity;

        return {
          menuId: item.menuId,
          quantity: item.quantity,
          price: item.price,
        };
      });

      try {
        const transaction = await Transaction.create(
          {
            userId,
            customerName,
            paymentMethod,
            notes,
            total,
          },
          { transaction: t }
        );

        const transactionItems = items.map((item) => ({
          transactionId: transaction.transactionId,
          menuId: item.menuId,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes || "",
        }));

        await TransactionMenu.bulkCreate(transactionItems, { transaction: t });
      } catch (e) {
        throw new AlertError(e.errors, `/menus/add`);
      }

      await t.commit();

      res.redirect("/transactions");
    } catch (e) {
      await t.rollback();
      next(e);
    }
  }

  static async getMenusAjax(req, res, next) {
    const { categoryId, search } = req.query;

    try {
      const menusWhere = { isAvailable: true };

      if (search) {
        menusWhere.name = { [Op.iLike]: `%${search}%` }; // Sequelize Op
      }

      if (categoryId) {
        menusWhere.categoryId = categoryId;
      }

      const menus = await Menu.findAll({
        where: menusWhere,
        include: {
          model: Category,
          as: "category",
          attributes: ["categoryId", "name"],
        },
      });

      res.json({ success: true, menus });
    } catch (e) {
      res.status(500).json({
        success: false,
        message: "Terjadi kesalahan saat memuat menu.",
      });
    }
  }
}

module.exports = TransactionController;
