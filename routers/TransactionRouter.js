const express = require("express");

const TransactionController = require("../controllers/TransactionController");
const TransactionRouter = express.Router();

TransactionRouter.get("/", TransactionController.getAll);

TransactionRouter.get("/:transactionId/detail", TransactionController.getAll);

TransactionRouter.get("/menus/ajax", TransactionController.getMenusAjax);
TransactionRouter.get("/new", TransactionController.showCreate);
TransactionRouter.post("/new", TransactionController.create);

TransactionRouter.get("/:transactionId/edit", TransactionController.getAll);
TransactionRouter.post("/:transactionId/edit", TransactionController.getAll);

TransactionRouter.get("/:transactionId/delete", TransactionController.getAll);

module.exports = TransactionRouter;
