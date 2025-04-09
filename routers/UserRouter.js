const express = require("express");

const UserController = require("../controllers/UserController");
const UserRouter = express.Router();

UserRouter.get("/", UserController.getAll);

UserRouter.get("/add", UserController.createForm);
UserRouter.post("/add", UserController.create);

UserRouter.get("/:userId/edit", UserController.updateForm);
UserRouter.post("/:userId/edit", UserController.update);

UserRouter.get("/:userId/delete", UserController.delete);

module.exports = UserRouter;
