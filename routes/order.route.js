const express = require('express');
const { isAuthenticatedUser } = require('../middlewares/auth');
const { createOrder, cancelOrder } = require('../controllers/order.controller');
const orderRouter = express.Router();


orderRouter.post("/create",isAuthenticatedUser,createOrder);
orderRouter.put('"/cancel/:orderId',isAuthenticatedUser,cancelOrder);

module.exports = orderRouter;