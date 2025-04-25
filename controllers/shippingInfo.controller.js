const ShippingInfo = require("../models/ShippingInfo.model");

const addOrUpdateShippingInfo = async (req, res) => {
  console.log("Request Body:", req.body);

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

  const finalUserId = userId || req.user?.id; // ✅ Fallback to avoid null userId

  console.log(finalUserId);

  if (!finalUserId) {
    console.error("Missing or invalid user ID:", finalUserId);
    return res
      .status(400)
      .json({ success: false, message: "User ID is required" });
  }

  // ✅ Fallback for missing fields
  const sanitizedAddress = {
    flatNo: flatNo || "",
    area: area || "",
    landmark: landmark || "",
    city: city || "",
    state: state || "",
    mobile: mobile || "",
    pincode: pincode || "",
    country: country || "INDIA",
    type: type || "Home",
    isDefault: isDefault ?? true,
  };

  try {
    let shippingInfo = await ShippingInfo.findOne({ user: finalUserId });

    if (shippingInfo) {
      // ✅ Sanitize existing addresses to prevent null issues
      if (isDefault) {
        shippingInfo.addresses.forEach((addr) => (addr.isDefault = false));
      }

      shippingInfo.addresses.push(sanitizedAddress);
      await shippingInfo.save();

      return res.status(200).json({
        success: true,
        message: "New address added successfully!",
        shippingInfo,
      });
    } else {
      // ✅ Create new shipping info with sanitized fields
      const newShippingInfo = new ShippingInfo({
        user: finalUserId,
        addresses: [sanitizedAddress],
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
    const userId = req.params.id;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const shippingInfo = await ShippingInfo.findOne({ user: userId });

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

const updateAddress = async (req, res) => {
  const { userId, addressId, updatedFields } = req.body;

  if (!userId || !addressId) {
    return res.status(400).json({
      success: false,
      message: "userId and addressId are required",
    });
  }

  try {
    const shippingInfo = await ShippingInfo.findOne({ user: userId });

    if (!shippingInfo) {
      return res.status(404).json({
        success: false,
        message: "Shipping info not found",
      });
    }

    const addressIndex = shippingInfo.addresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    console.log(
      "Address  in DB:",
      shippingInfo.addresses
    );
    console.log(
      "Address IDs in DB:",
      shippingInfo.addresses.map((addr) => addr._id.toString())
    );
    console.log("Provided addressId:", addressId);

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // If this address is being set as default, unset all others
    if (updatedFields?.isDefault === true) {
      shippingInfo.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    // Update the address fields
    Object.assign(shippingInfo.addresses[addressIndex], updatedFields);

    // Save the updated document
    await shippingInfo.save();

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      shippingInfo,
    });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { addOrUpdateShippingInfo, getShippingInfo, updateAddress };
