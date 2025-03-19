const express = require("express");
const {
  addOrUpdateShippingInfo,
  getShippingInfo,
} = require("../controllers/shippingInfo.controller");
const { isAuthenticatedUser } = require("../middlewares/auth");
const shippingRouter = express.Router();

// adminRoutes
shippingRouter.post("/shippingInfo/add", isAuthenticatedUser, addOrUpdateShippingInfo);
shippingRouter.get("/shippingInfo",isAuthenticatedUser, getShippingInfo);

module.exports = shippingRouter;
