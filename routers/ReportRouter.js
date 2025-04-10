const express = require("express");

const ReportController = require("../controllers/ReportController");
const ReportRouter = express.Router();

ReportRouter.get("/menu", ReportController.getMenuSalesReport);

module.exports = ReportRouter;
