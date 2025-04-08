const express = require('express');
const { isAuthenticatedUser } = require('../middlewares/auth');
const { createOrder, cancelOrder, getOrders, getUserOrders } = require('../controllers/order.controller');
const orderRouter = express.Router();


orderRouter.post('/create',createOrder);
orderRouter.put('/cancel/:orderId',cancelOrder);
orderRouter.get('/orders/all',getOrders);
orderRouter.get("/orders/:userId", getUserOrders);


module.exports = orderRouter;