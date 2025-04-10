const express = require('express');
const { isAuthenticatedUser } = require('../middlewares/auth');
const { createOrder, cancelOrder, getOrders, getUserOrders, updateOrderStatus } = require('../controllers/order.controller');
const orderRouter = express.Router();


orderRouter.post('/create',createOrder);
orderRouter.put('/cancel/:orderId',cancelOrder);
orderRouter.get('/orders',getOrders);
orderRouter.get("/orders/:userId", getUserOrders);
orderRouter.put('/admin/order/:orderId/status',updateOrderStatus);


module.exports = orderRouter;