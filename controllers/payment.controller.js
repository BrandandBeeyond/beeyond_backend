const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/Payment.model");

const razorpayInstance = new Razorpay({
  key_id: process.env.key_id,
  key_secret: process.env.key_secret,
});

const createOrder = async (req, res) => {
  const { amount } = req.body;
  try {
    const options = {
      amount: Number(amount * 100),
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"),
    };

    razorpayInstance.orders.create(options, (error, order) => {
      if (error) {
        res
          .status(400)
          .json({ success: false, message: "something wents wrong" });
      }
      res.status(200).json({ success: true, data: order });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  try {
    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(sign.toString())
      .digest("hex");

    const isAuthentic = expectedSign === razorpay_signature;

    if (isAuthentic) {
      const payment = new Payment({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });

      await payment.save();

      res.json({ message: "Payment Successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error!" });
  }
};


module.exports = {createOrder,verifyPayment}