const express = require('express');
const { createOrder, verifyPayment } = require('../controllers/payment.controller');
const paymentRouter = express.Router();

paymentRouter.post('/order',createOrder);
paymentRouter.post('/verifypayment',verifyPayment);

module.exports = paymentRouter;