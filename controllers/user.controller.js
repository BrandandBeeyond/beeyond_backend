const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_SERVICE_SID,
  EMAIL_USER,
  EMAIL_PASS,
} = require("../config/config");
const sendToken = require("../config/sendToken");
const asyncErrorHandler = require("../middlewares/asyncErrorHandler");
const User = require("../models/User.model");
const twilio = require("twilio");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const otpStore = new Map();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

const checkUserExist = asyncErrorHandler(async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        userExists: false,
        message: "Please Enter Email",
      });
    }

    const user = await User.findOne({ email });

    return res.status(200).json({
      success: true,
      userExists: !!user, // Ensures it is always a boolean
      message: user
        ? "User exists, proceed to login"
        : "User does not exist, proceed to registration",
    });
  } catch (error) {
    console.error("Error in checkUserExist:", error);
    return res.status(500).json({
      success: false,
      userExists: false,
      message: "Something went wrong. Please try again later.",
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

    const existingMobile = await User.findOne({ mobile });

    if (existingMobile) {
      return res.status(400).json({
        success: false,
        message: "This mobile number is already in use",
      });
    }
    const user = await User.create({
      name,
      email,
      password,
      mobile,
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

const sendOTP = async (req, res) => {
  let { phoneNumber } = req.body ?? {};

 
  
  try {
    if (
      !process.env.TWILIO_ACCOUNT_SID ||
      !process.env.TWILIO_AUTH_TOKEN ||
      !process.env.TWILIO_SERVICE_SID
    ) {
      console.error("Missing Twilio credentials");
      return res.status(500).json({
        success: false,
        message:
          "Missing Twilio credentials. Please check your environment variables.",
      });
    }

    // Format phone number correctly for Twilio
    if (!phoneNumber.startsWith("+")) {
      phoneNumber = `+${phoneNumber}`;
    }

    // Send OTP using Twilio
    const result = await client.verify.v2
      .services(process.env.TWILIO_SERVICE_SID)
      .verifications.create({
        channel: "sms",
        to: phoneNumber,
      });

    console.log("OTP Sent Successfully:", result);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in sendOTP:", error);

    return res.status(500).json({
      success: false,
      message: "Error in sending OTP",
      error: error.message,
    });
  }
};




const verifyOTP = async (req, res) => {
  const { phoneNumber, otp } = req.body ?? {};
  try {
    const result = await client.verify.v2
      .services(TWILIO_SERVICE_SID)
      .verificationChecks.create({
        to: `+${phoneNumber}`,
        code: otp,
      });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Error in verifying otp`,
    });
  }
};

const sendEmailOTP = asyncErrorHandler(async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Please Enter email" });
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found with this email" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    otpStore.set(email, otp);

    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: "Beeyond",
      text: `your otp code is ${otp},it is valid for 5 mins`,
    };

    await transporter.sendMail(mailOptions);
    return res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("unable to send otp", error);
    return res.json({ success: false, message: "something wents wrong" });
  }
});

const verifyEmailOTP = asyncErrorHandler(async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });
    }

    const storedOtp = otpStore.get(email);

    if (!storedOtp || storedOtp !== otp) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    otpStore.delete(email);

    // Send JWT token
    sendToken(user, 200, res);
  } catch (error) {
    console.error("unable to send otp", error);
    return res.json({ success: false, message: "something wents wrong" });
  }
});

module.exports = {
  checkUserExist,
  registerUser,
  loginUser,
  logoutUser,
  sendOTP,
  verifyOTP,
  sendEmailOTP,
  verifyEmailOTP,
};
