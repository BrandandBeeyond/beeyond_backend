const Order = require("../models/Order.model");
const ShippingInfo = require("../models/ShippingInfo.model");

const createOrder = async (req, res) => {
  try {
    console.log("📥 Incoming Order Request:", req.body);

    const { userId, shippingId, orderItems, paymentInfo, totalPrice } =
      req.body;

    if (!userId || !shippingId || !orderItems || !paymentInfo || !totalPrice) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const shippingInfo = await ShippingInfo.findById(shippingId);

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

    // Log for clarity
    console.log("📦 Final Order Details:", {
      user: userId,
      shippingInfo: selectedAddress,
      orderItems,
      paymentInfo,
      totalPrice,
    });

    const order = new Order({
      user: userId,
      shippingInfo: selectedAddress,
      orderItems,
      paymentInfo,
      totalPrice,
      paidAt: Date.now(),
      orderStatus: "Processing",
    });

    await order.save(); // <-- This might be failing silently

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("🔥 Error saving order:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled",
      });
    }

    order.orderStatus = "Cancelled";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find();

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(userId);

    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ["Processing", "Shipped", "Delivered", "Cancelled"];

    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order status" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.orderStatus = status;

    if (status === "Shipped") {
      order.shippedAt = new Date();
    }

    if (status === "Delivered") {
      order.deliveredAt = new Date();
    }

    await order.save();
    res
      .status(200)
      .json({ success: true, message: "Order status updated", order });

  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Something went wrong",
        error: error.message,
      });
  }
};

module.exports = { createOrder, cancelOrder, getOrders, getUserOrders,updateOrderStatus };
