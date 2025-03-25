const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/Payment.model");

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

const createOrder = async (req, res) => {
  const { amount } = req.body;

  try {
   
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    const options = {
      amount: Number(amount * 100), // Amount in paise
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"),
    };

    razorpayInstance.orders.create(options, async (error, order) => {
      if (error) {
        console.error("Error creating order:", error);
        return res.status(400).json({ success: false, message: "Failed to create order" });
      }

      // ✅ Return the order details
      res.status(201).json({ success: true, data: order });
    });

  } catch (error) {
    console.error("Server error:", error);
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