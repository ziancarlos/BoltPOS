const express = require("express");
const AuthController = require("../controllers/AuthController");
const GuestMiddleware = require("../middlewares/GuestMiddleware");
const AuthRouter = express.Router();

AuthRouter.get("/login", GuestMiddleware, AuthController.showLogin);
AuthRouter.post("/login", GuestMiddleware, AuthController.login);

module.exports = AuthRouter;
