const Order = require("../models/Order.model");
const ShippingInfo = require("../models/ShippingInfo.model");

const createOrder = async (req, res) => {
  try {
    const { shippingId, orderItems, paymentInfo, totalPrice } = req.body;

    const shippingInfo = await ShippingInfo.findOne({ _id: shippingId });

    if (!shippingInfo) {
      return res
        .status(404)
        .json({ success: false, message: "Shipping address not found" });
    }

    const selectedAddress =
      shippingInfo.addresses.find((add) => add.isDefault) ||
      shippingInfo.addresses[0];

    if (!selectedAddress) {
      return res
        .status(400)
        .json({ success: false, message: "No valid shipping info found" });
    }

    const order = new Order({
      user: req.user.id,
      shippingInfo: selectedAddress,
      orderItems,
      paymentInfo,
      totalPrice,
      paidAt: Date.now(),
      orderStatus: "Processing",
    });

    await order.save();

    res
      .status(201)
      .json({ success: true, message: "Order placed successfully", order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res
        .status(400)
        .json({ sucess: false, message: "order not found" });
    }

    if (order.orderStatus === "Cancelled") {
      return res.status({
        success: false,
        message: "Order is Already cancelled",
      });
    }

    order.orderStatus = "Cancelled";
    await order.save();

    res
      .status(200)
      .json({ success: true, message: "Order cancelled successfully", order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createOrder,cancelOrder };
