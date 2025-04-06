const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },

  shippingInfo: {
    flatNo: {
      type: String,
      required: true,
    },
    area: {
      type: String,
      required: false,
    },
    landmark: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,  
      required: true,
    },
    pincode: {
      type: String, 
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },

  orderItems: [
    {
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      product: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
        required: true,
      },
    },
  ],

  paymentInfo: {
    id: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },

  paidAt: {
    type: Date,
    required: true,
    default: Date.now,
  },

  totalPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    default: () => `ORDER-${Math.floor(100000 + Math.random() * 900000)}` 
  },

  orderStatus: {
    type: String,
    required: true,
    default: "Processing",
    enum: ["Processing", "Shipped", "Delivered", "Cancelled"],  // Added enum for better validation
  },

  deliveredAt: Date,
  shippedAt: Date,

}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
