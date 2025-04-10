const { Op } = require("sequelize");
const {
  receiveSuccessAlert,
  receiveErrorAlert,
  setSuccessAlert,
} = require("../helpers/helper");
const {
  Transaction,
  Menu,
  Category,
  TransactionMenu,
  sequelize,
  User,
} = require("../models");
const {
  createValidation,
  transactionIdValidation,
} = require("../validations/TransactionValidation");
const validate = require("../validations/validate");
const AlertError = require("../errors/AlertError");
const SwalError = require("../errors/SwalError");

class TransactionController {
  static async getAll(req, res, next) {
    const { username, role, userId, fullName } = req.user;
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
          fullName,
        },
        currentPath,
      });
    } catch (e) {
      console.log(e);
      next(e);
    }
  }

  static async get(req, res, next) {
    try {
      const { username, role, userId, fullName } = req.user;
      const currentPath = req.path;
      const successMessage = receiveSuccessAlert(req);
      const errorMessage = receiveErrorAlert(req);

      let { transactionId } = req.params;
      transactionId = validate(
        transactionIdValidation,
        transactionId,
        (message) => {
          throw new SwalError(message[0].message, "/transactions");
        }
      );

      const transaction = await Transaction.findOne({
        where: {
          transactionId,
        },
        include: [
          {
            model: TransactionMenu,
            as: "menus",
            attributes: ["transactionMenuId", "quantity", "price", "subtotal"],
            include: [
              {
                model: Menu, // Assuming your Menu model is named 'Menu'
                as: "menu", // This should match the association alias you defined
                attributes: ["menuId", "name", "price"], // Include the menu attributes you need
              },
            ],
          },
        ],
      });

      if (!transaction) {
        throw new SwalError("Tidak menemukan menu.", "/menus");
      }

      res.render("transaction/DetailTransaction", {
        transaction,
        successMessage,
        errorMessage,

        user: {
          userId,
          username,
          role,
          fullName,
        },
        currentPath,
      });
    } catch (e) {
      next(e);
    }
  }

  static async showCreate(req, res, next) {
    const { username, role, userId, fullName } = req.user;
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
          fullName,
        },
        currentPath,
        errors,
      });
    } catch (e) {
      console.log(e);
      next(e);
    }
  }

  static async create(req, res, next) {
    const { username, role, userId, fullName } = req.user;

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

        setSuccessAlert(req, "Berhasil menambahkan transaksi.");

        res.redirect("/transactions");
      } catch (e) {
        throw new AlertError(e.errors, `/transactions/new`);
      }

      await t.commit();

      res.redirect("/transactions");
    } catch (e) {
      console.log(e);
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

  static async changeStatus(req, res, next) {
    try {
      let { transactionId } = req.params;

      transactionId = validate(
        transactionIdValidation,
        transactionId,
        (message) => {
          throw new SwalError(message[0].message, "/transactions");
        }
      );

      // Find the transaction
      const transaction = await Transaction.findOne({
        where: { transactionId },
      });

      if (!transaction) {
        throw new SwalError("Transaksi tidak ditemukan", "/transactions");
      }

      // Determine next status
      let nextStatus;
      switch (transaction.status) {
        case "PENDING":
          nextStatus = "PROSES";
          break;
        case "PROSES":
          nextStatus = "SELESAI";
          break;
        case "SELESAI":
          throw new SwalError(
            "Transaksi sudah selesai dan tidak dapat diubah lagi",
            `/transactions/${transactionId}/detail`
          );
        case "DIBATALKAN":
          throw new SwalError(
            "Transaksi yang dibatalkan tidak dapat diubah statusnya",
            `/transactions/${transactionId}/detail`
          );
        default:
          throw new SwalError(
            "Status transaksi tidak valid",
            `/transactions/${transactionId}/detail`
          );
      }

      try {
        await transaction.update({ status: nextStatus });
      } catch (e) {
        throw new SwalError(
          "Gagal merubah status transaksi.",
          `/transactions/${transactionId}/detail`
        );
      }
      // Redirect with success message
      setSuccessAlert(req, "Berhasil mengubah status transaksi.");

      res.redirect(`/transactions/${transactionId}/detail`);
    } catch (error) {
      next(error);
    }
  }

  static async changeDeleteStatus(req, res, next) {
    try {
      let { transactionId } = req.params;

      transactionId = validate(
        transactionIdValidation,
        transactionId,
        (message) => {
          throw new SwalError(message[0].message, "/transactions");
        }
      );

      // Find the transaction
      const transaction = await Transaction.findOne({
        where: { transactionId },
      });

      if (!transaction) {
        throw new SwalError("Transaksi tidak ditemukan", "/transactions");
      }

      try {
        await transaction.update({ status: "DIBATALKAN" });
      } catch (e) {
        throw new SwalError(
          "Gagal merubah status transaksi.",
          `/transactions/${transactionId}/detail`
        );
      }
      // Redirect with success message
      setSuccessAlert(req, "Berhasil mengubah status transaksi.");

      res.redirect(`/transactions/${transactionId}/detail`);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TransactionController;
