const asyncErrorHandler = require("../middlewares/asyncErrorHandler");
const User = require("../models/User.model");

const checkUserExist = asyncErrorHandler(async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Please Enter Email" });
    }

    const user = User.findOne({ email });

    if (user) {
      return res.status(200).json({
        success: true,
        message: "User exists,Provide password to login",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "User does not exist, proceed to registration",
      });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(404)
      .json({ success: false, message: "Something wents wrong" });
  }
});

const registerUser = asyncErrorHandler(async (req, res, next) => {
  try {
    const { name, email, password, mobile } = req.body;

    if (!name || !email || !password || !mobile) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter all required fields" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "user already exists" });
    }

    const user = await User.create({
        name,email,password
    });

    return res.status(200).json({
        success:true,
        message:'User registration successfull',
        data:user
    })
  } catch (error) {
    console.error(error);
    return res
      .status(404)
      .json({ success: false, message: "Something wents wrong" });
  }
});

module.exports = {
  checkUserExist,
  registerUser,
};
