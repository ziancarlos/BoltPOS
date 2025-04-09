const express = require("express");

const CategoryController = require("../controllers/CategoryController");
const CategoryRouter = express.Router();

CategoryRouter.get("/", CategoryController.getAll);

CategoryRouter.get("/:categoryId/detail", CategoryController.get);

CategoryRouter.get("/add", CategoryController.createForm);
CategoryRouter.post("/add", CategoryController.create);

CategoryRouter.get("/:categoryId/edit", CategoryController.updateForm);
CategoryRouter.post("/:categoryId/edit", CategoryController.update);

CategoryRouter.get("/:categoryId/delete", CategoryController.delete);

module.exports = CategoryRouter;
