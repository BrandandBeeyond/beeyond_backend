const express = require("express");
const {
  addOrUpdateShippingInfo,
  getShippingInfo,
  updateAddress,
} = require("../controllers/shippingInfo.controller");
const { isAuthenticatedUser } = require("../middlewares/auth");
const shippingRouter = express.Router();

// adminRoutes
shippingRouter.post("/shippingInfo/add", addOrUpdateShippingInfo);
shippingRouter.get("/shippingInfo/:id", getShippingInfo);
shippingRouter.put("/shippingInfo/update", updateAddress);

module.exports = shippingRouter;