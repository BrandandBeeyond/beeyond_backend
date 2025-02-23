const express = require("express");
const {
  checkUserExist,
  registerUser,
  loginUser,
  logoutUser,
  sendOTP,
  verifyOTP,
  sendEmailOTP,
} = require("../controllers/user.controller");
const userRouter = express.Router();

userRouter.post("/check-user", checkUserExist);
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/logout", logoutUser);

// otp routes

userRouter.post("/send-otp", sendOTP);
userRouter.post("/verify-otp", verifyOTP);

userRouter.post('/send-email-otp',sendEmailOTP)

module.exports = userRouter;
