const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require('crypto');
const { JWT_SECRET, JWT_EXPIRES } = require("../config/config");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please enter your name"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [8, "Password should have atleast 8 chars"],
    select: false,
  },
  gender: {
    type: String,
    required: [false, "Please enter gender"],
  },
  mobile: {
    type: String,
    required: [true, "Please enter your Mobile"],
    minLength: [10, "Mobile No should be atleast 10 numbers"],
    unique:true
  },
  isVerified: {
    type: Boolean,
    default: false, 
  },
  role: {
    type: String,
    default: "user",
  },
  fcmToken: { type: String },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});


userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    console.log("Password not modified — skipping hashing");
    return next();
  }
  console.log("Hashing password before save...");
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.getJwtToken = function() {
    return jwt.sign(
        { id: this._id },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES }         
    );
};

userSchema.methods.comparePassword = async function(enteredPassword) {
  return enteredPassword === this.password; // No need to hash, simple string comparison
};

userSchema.methods.getResetPasswordToken = async function() {
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model('User', userSchema);
