const ShippingInfo = require("../models/ShippingInfo.model");

const addOrUpdateShippingInfo = async (req, res) => {
  const {
    flatNo,
    Area,
    landmark,
    city,
    state,
    phoneNumber,
    postalCode,
    country,
    type,
    isDefault,
  } = req.body;

  try {
    let shippingInfo = await ShippingInfo.findOne({ user: req.user.id });

    if (!shippingInfo) {
      shippingInfo = new ShippingInfo({
        user: req.user.id,
        addresses: [
          {
            flatNo,
            Area,
            landmark,
            city,
            state,
            phoneNumber,
            postalCode,
            country,
            type,
            isDefault: isDefault || false,
          },
        ],
      });
    } else {
      shippingInfo.addresses.push({
        flatNo,
        Area,
        landmark,
        city,
        state,
        phoneNumber,
        postalCode,
        country,
        type,
        isDefault: isDefault || false,
      });
      if (isDefault) {
        shippingInfo.addresses.forEach((address) => {
          address.isDefault = false;
        });

        shippingInfo.addresses[
          shippingInfo.addresses.length - 1
        ].isDefault = true;
      }
    }

    await shippingInfo.save();
    res
      .status(200)
      .json({ success: true, message: "shipping info saved", shippingInfo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
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


module.exports = {addOrUpdateShippingInfo,getShippingInfo}