const express = require('express');
const { isAuthenticatedUser } = require('../middlewares/auth');
const { createOrder, cancelOrder } = require('../controllers/order.controller');
const orderRouter = express.Router();


orderRouter.post("/create",createOrder);
orderRouter.put('"/cancel/:orderId',cancelOrder);

module.exports = orderRouter;