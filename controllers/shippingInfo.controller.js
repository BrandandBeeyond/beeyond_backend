const ShippingInfo = require("../models/ShippingInfo.model");

const addOrUpdateShippingInfo = async (req, res) => {
  const {
    userId,
    flatNo,
    area,
    landmark,
    city,
    state,
    phoneNumber,
    postalCode,
    country,
    type,
    isDefault,
  } = req.body;

  if (
    !userId ||
    !flatNo ||
    !city ||
    !state ||
    !phoneNumber ||
    !postalCode ||
    !country ||
    !type
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all required fields." });
  }

  try {
    let shippingInfo = await ShippingInfo.findOne({ user: userId });

    if (shippingInfo) {
      // ✅ If shipping info exists, add a new address
      const newAddress = {
        flatNo,
        Area: area || "",
        landmark: landmark || "",
        city,
        state,
        phoneNumber,
        postalCode,
        country,
        type,
        isDefault: isDefault || false,
      };

      // If isDefault is true, make all other addresses non-default
      if (isDefault) {
        shippingInfo.addresses.forEach((addr) => {
          addr.isDefault = false;
        });
      }

      shippingInfo.addresses.push(newAddress);
      await shippingInfo.save();

      return res.status(200).json({
        success: true,
        message: "New address added successfully!",
        shippingInfo,
      });
    } else {
      // ✅ If shipping info doesn't exist, create a new entry
      const newShippingInfo = new ShippingInfo({
        user: userId,
        addresses: [
          {
            flatNo,
            Area: area || "",
            landmark: landmark || "",
            city,
            state,
            phoneNumber,
            postalCode,
            country,
            type,
            isDefault: isDefault || true,
          },
        ],
      });

      await newShippingInfo.save();

      return res.status(201).json({
        success: true,
        message: "Shipping info saved successfully!",
        shippingInfo: newShippingInfo,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error. Please try again." });
  }
};

const getShippingInfo = async (req, res) => {
  try {
    const shippingInfo = await ShippingInfo.findOne({ user: req.user.id });

    if (!shippingInfo) {
      return res
        .status(404)
        .json({ success: false, message: "No shipping info found" });
    }

    res.status(200).json({ success: true, shippingInfo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { addOrUpdateShippingInfo, getShippingInfo };
