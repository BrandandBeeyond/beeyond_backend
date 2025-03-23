const express = require('express');
const { createOrder } = require('../controllers/payment.controller');
const paymentRouter = express.Router();

paymentRouter.post('/order',createOrder);
paymentRouter.post('/verifypayment',)

module.exports = paymentRouter;