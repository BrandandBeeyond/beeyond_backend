const express = require("express");
const {
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
  resetPassword,
  changePassword,
  verifyOtpAndRegister,
} = require("../controllers/user.controller");
const userRouter = express.Router();

userRouter.post("/check-user", checkUserExist);
userRouter.post("/register", registerUser);
userRouter.post("/verify-otp-register", verifyOtpAndRegister);
userRouter.post("/login", loginUser);
userRouter.get("/logout", logoutUser);

userRouter.get("/check-mobile/:mobile", checkMobile);
userRouter.put("/edit/:userId", editUser);
// otp routes

userRouter.post("/send-otp", sendOTP);
userRouter.post("/verify-otp", verifyOTP);

userRouter.post("/send-email-otp", sendEmailOTP);
userRouter.post("/verify-email-otp", verifyEmailOTP);

userRouter.post('/reset-password',resetPassword);
userRouter.post('/change-password',changePassword);

userRouter.post("/sendmailsms", sendOrderEmailSms);

module.exports = userRouter;
