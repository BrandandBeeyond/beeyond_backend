const ShippingInfo = require("../models/ShippingInfo.model");

const addOrUpdateShippingInfo = async (req, res) => {
  console.log("Request Body:", req.body);          // ✅ Log the request body
  console.log("User from Middleware:", req.user);   // ✅ Log the user from middleware

  const {
    userId,
    flatNo,
    area,
    landmark,
    city,
    state,
    mobile,
    pincode,
    country,
    type,
    isDefault,
  } = req.body;

  // Fallback to req.user.id if userId is missing in body
  const finalUserId = userId || req.user?.id;
  console.log("Final User ID:", finalUserId);       // ✅ Log the final user ID

  if (
    !finalUserId ||
    !flatNo ||
    !city ||
    !state ||
    !mobile ||
    !pincode ||
    !country ||
    !type
  ) {
    console.log("Validation Failed: Missing required fields");
    return res
      .status(400)
      .json({ success: false, message: "Please provide all required fields." });
  }

  try {
    let shippingInfo = await ShippingInfo.findOne({ user: finalUserId });
    console.log("Shipping Info Found:", shippingInfo);

    if (shippingInfo) {
      // ✅ If shipping info exists, add a new address
      const newAddress = {
        flatNo,
        area: area || "",
        landmark: landmark || "",
        city,
        state,
        mobile,
        pincode,
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

      console.log("New Address Added:", newAddress);

      return res.status(200).json({
        success: true,
        message: "New address added successfully!",
        shippingInfo,
      });
    } else {
      // ✅ If shipping info doesn't exist, create a new entry
      const newShippingInfo = new ShippingInfo({
        user: finalUserId,
        addresses: [
          {
            flatNo,
            area: area || "",
            landmark: landmark || "",
            city,
            state,
            mobile,
            pincode,
            country,
            type,
            isDefault: isDefault || true,
          },
        ],
      });

      await newShippingInfo.save();

      console.log("New Shipping Info Saved:", newShippingInfo);

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
