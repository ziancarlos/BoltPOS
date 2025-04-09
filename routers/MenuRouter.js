const express = require("express");

const MenuController = require("../controllers/MenuController");
const upload = require("../middlewares/UploadMiddleware");
const MenuRouter = express.Router();

MenuRouter.get("/", MenuController.getAll);

MenuRouter.get("/:menuId/detail", MenuController.get);

MenuRouter.get("/add", MenuController.createForm);
MenuRouter.post("/add", upload.single("image"), MenuController.create);

MenuRouter.get("/:menuId/edit", MenuController.updateForm);
MenuRouter.post("/:menuId/edit", upload.single("image"), MenuController.update);

MenuRouter.get("/:menuId/delete", MenuController.delete);

module.exports = MenuRouter;
