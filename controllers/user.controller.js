const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_SERVICE_SID,
  EMAIL_USER,
  EMAIL_PASS,
  ADMIN_PHONE,
  TWILIO_PHONE_NUMBER,
  ADMIN_EMAIL,
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
      isVerified: true,
    });

    sendToken(user, 201, res);
  } catch (error) {
    console.error(error);
    return res
      .status(404)
      .json({ success: false, message: "Something wents wrong" });
  }
});

const editUser = asyncErrorHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, mobile } = req.body;

    if (!name && !email && !mobile) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one field to update",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res
          .status(400)
          .json({ success: false, message: "This email is already in use" });
      }
    }

    if (mobile && mobile !== user.mobile) {
      const existingMobile = await User.findOne({ mobile });
      if (existingMobile) {
        return res.status(400).json({
          success: false,
          message: "This mobile number is already in use",
        });
      }
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (mobile) user.mobile = mobile;

    await user.save();

    // ✅ Return success response after saving
    return res.json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
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
  console.log("Full request body:", req.body);

  // ✅ Ensure phoneNumber exists and is a valid string
  if (
    !req.body ||
    typeof req.body.phoneNumber !== "string" ||
    req.body.phoneNumber.trim() === ""
  ) {
    return res.status(400).json({
      success: false,
      message: "Missing or invalid phone number in request body",
    });
  }

  let { phoneNumber } = req.body;
  phoneNumber = phoneNumber.trim(); // Remove extra spaces

  console.log("Received phone number:", phoneNumber);

  try {
    // ✅ Validate Twilio credentials
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

    // ✅ Ensure phone number starts with "+"
    if (!phoneNumber.startsWith("+")) {
      phoneNumber = `+${phoneNumber}`;
    }

    // ✅ Validate phone number format (Only digits after "+")
    if (!/^\+\d{10,15}$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid phone number format. Must be in E.164 format (e.g., +919876543210).",
      });
    }

    // ✅ Send OTP using Twilio
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
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) {
    return res.status(400).json({
      success: false,
      message: "Phonenumber and otp are mandatory",
    });
  }

  try {
    if (!process.env.TWILIO_SERVICE_SID) {
      return res.status(500).json({
        success: false,
        message: "Missing Twilio service sid",
      });
    }

    const formattedNumber = phoneNumber.startsWith("+")
      ? phoneNumber
      : `+${phoneNumber}`;

    const result = await client.verify.v2
      .services(process.env.TWILIO_SERVICE_SID)
      .verificationChecks.create({
        to: formattedNumber,
        code: otp,
      });

    if (result.status === "approved") {
      let user = await User.findOne({ mobile: phoneNumber });

      if (user) {
        return sendToken(user, 200, res);
      }

      return res.status(200).json({
        success: true,
        message: "OTP verified successfully",
        isVerified: true,
        data: result,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again.",
      });
    }
  } catch (error) {
    console.error("Error in verifyOTP:", error);
    return res.status(500).json({
      success: false,
      message: "Error in verifying OTP",
      error: error.message,
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
      subject: "OTP Verification From Beeyond",
      text: `${otp} is your OTP to proceed further with Beeyond. OTPs are confidential. For security reasons, please do not share it with anyone.`,
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

const checkMobile = asyncErrorHandler(async (req, res) => {
  try {
    const { mobile } = req.params;

    const user = await User.findOne({ mobile });

    if (user) {
      return res.json({ exists: true, verified: user.isVerified });
    }

    return res.json({ exists: false, verified: false });
  } catch (error) {
    console.error("Error checking mobile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const sendOrderEmailSms = async (req, res) => {
  try {
    const { eventType, user, orderDetails } = req.body;

    if (!eventType || !user || !orderDetails) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: eventType, user, or orderDetails",
      });
    }

    const eventMessages = {
      order_placed: "has been placed successfully",
      order_shipped: "has been shipped",
      order_delivered: "has been delivered",
      order_cancelled: "has been cancelled",
    };

    const eventMessage = eventMessages[eventType];

    if (!eventMessage) {
      return res.status(400).json({
        success: false,
        message: "Invalid event type",
      });
    }

    const orderId = orderDetails.orderId || orderDetails._id || "Order";

    // const userSmsText = `Hello ${user.name}, your order ${orderId} ${eventMessage} - Beeyond`;
    // const adminSmsText = `Order ${orderId} ${eventMessage} by ${user.name}.`;

    // const userPhone = user.mobile.startsWith("+")
    //   ? user.mobile
    //   : `+${user.mobile}`;

    //   console.log("getting user phone",userPhone);
      
    // const adminPhone = ADMIN_PHONE.startsWith("+")
    //   ? ADMIN_PHONE
    //   : `+${ADMIN_PHONE}`;

    //   console.log('getting admin phone',adminPhone);
      

    // await client.messages.create({
    //   to: userPhone,
    //   from: TWILIO_PHONE_NUMBER,
    //   body: userSmsText,
    // });

    // await client.messages.create({
    //   to: adminPhone,
    //   from: TWILIO_PHONE_NUMBER,
    //   body: adminSmsText,
    // });

    const userEmailOptions = {
      rom: EMAIL_USER,
      to: user.email,
      subject: `Your Order ${orderId} ${eventMessage}`,
      text: `Hi ${user.name},\n\nYour order ${orderId} ${eventMessage}.\n\nThank you for shopping with Beeyond!`,
    };

    const adminEmailOptions = {
      from: EMAIL_USER,
      to: ADMIN_EMAIL,
      subject: `Order ${orderId} ${eventMessage}`,
      text: `Admin,\n\nOrder ${orderId} by ${user.name} (${
        user.email
      }) ${eventMessage}.\n\nOrder Details:\n${JSON.stringify(
        orderDetails,
        null,
        2
      )}`,
    };

    await transporter.sendMail(userEmailOptions);
    await transporter.sendMail(adminEmailOptions);

    return res.status(200).json({
      success: true,
      message: `Notification for '${eventType}' sent to user and admin`,
    });
  } catch (error) {
    console.error("Notification error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send notification",
      error: error.message,
    });
  }
};

module.exports = {
  checkUserExist,
  registerUser,
  loginUser,
  logoutUser,
  sendOTP,
  verifyOTP,
  sendEmailOTP,
  verifyEmailOTP,
  checkMobile,
  editUser,
  sendOrderEmailSms,
};
