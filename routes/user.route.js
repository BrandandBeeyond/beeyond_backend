const express = require("express");
const {
  checkUserExist,
  registerUser,
  loginUser,
  logoutUser,
} = require("../controllers/user.controller");
const userRouter = express.Router();

userRouter.post("/check-user", checkUserExist);
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/logout", logoutUser);


module.exports = userRouter