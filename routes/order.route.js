const express = require('express');
const { isAuthenticatedUser } = require('../middlewares/auth');
const { createOrder, cancelOrder, getOrders } = require('../controllers/order.controller');
const orderRouter = express.Router();


orderRouter.post("/create",createOrder);
orderRouter.put('"/cancel/:orderId',cancelOrder);
orderRouter.get('"/orders/all',getOrders);

module.exports = orderRouter;