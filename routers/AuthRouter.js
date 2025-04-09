const express = require("express");
const AuthController = require("../controllers/AuthController");
const AuthRouter = express.Router();

AuthRouter.get("/login", AuthController.showLogin);
AuthRouter.post("/login", AuthController.login);

module.exports = AuthRouter;
