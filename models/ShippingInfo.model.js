const mongoose = require("mongoose");

const shippingInfoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  addresses: [
    {
      flatNo: {
        type: String,       // Changed to String to support alphanumeric values
        required: true,
      },
      area: {
        type: String,
        required: false,
      },
      landmark: {
        type: String,        // Changed to String for flexibility
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
      isDefault: {
        type: Boolean,
        default: false,      
      }
    }
  ]
}, { timestamps: true });

const ShippingInfo = mongoose.model("ShippingInfo", shippingInfoSchema);

module.exports = ShippingInfo;
