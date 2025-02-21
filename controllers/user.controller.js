const sendToken = require("../config/sendToken");
const asyncErrorHandler = require("../middlewares/asyncErrorHandler");
const User = require("../models/User.model");

const checkUserExist = asyncErrorHandler(async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        userExists: false, 
        message: "Please Enter Email" 
      });
    }

    const user = await User.findOne({ email });

    return res.status(200).json({
      success: true,
      userExists: !!user,  // Ensures it is always a boolean
      message: user ? "User exists, proceed to login" : "User does not exist, proceed to registration",
    });

  } catch (error) {
    console.error("Error in checkUserExist:", error);
    return res.status(500).json({ 
      success: false, 
      userExists: false, 
      message: "Something went wrong. Please try again later." 
    });
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
      name,
      email,
      password,
      mobile
    });

    sendToken(user, 201, res);
  } catch (error) {
    console.error(error);
    return res
      .status(404)
      .json({ success: false, message: "Something wents wrong" });
  }
});

const loginUser = asyncErrorHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    sendToken(user, 200, res);
  } catch (error) {
    console.error(error);
    return res
      .status(404)
      .json({ success: false, message: "Something wents wrong" });
  }
});

const logoutUser = asyncErrorHandler(async (req, res, next) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "logged out",
    });
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
  loginUser,
  logoutUser
};
