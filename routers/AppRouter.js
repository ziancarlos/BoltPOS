const express = require("express");
const AuthMiddleware = require("../middlewares/AuthMiddlewares");
const AppController = require("../controllers/AppController");
const CategoryRouter = require("./CategoryRouter");
const MenuRouter = require("./MenuRouter");
const ErrorMiddleware = require("../middlewares/ErrorMiddlewares");
const UserRouter = require("./UserRouter");
const UserController = require("../controllers/UserController");
const TransactionRouter = require("./TransactionRouter");
const ReportRouter = require("./ReportRouter");

const AppRouter = express.Router();

AppRouter.use(AuthMiddleware);

AppRouter.get("/dashboard", AppController.showDashboard);

AppRouter.get("/profile", UserController.updateProfileForm);
AppRouter.post("/profile", UserController.updateProfile);

AppRouter.use("/categories", CategoryRouter);
AppRouter.use("/menus", MenuRouter);
AppRouter.use("/users", UserRouter);
AppRouter.use("/transactions", TransactionRouter);
AppRouter.use("/reports", ReportRouter);

AppRouter.get("/logout", (req, res) => {
  delete req.session.accessToken;
  res.redirect("/login");
});

AppRouter.use(ErrorMiddleware);

module.exports = AppRouter;
