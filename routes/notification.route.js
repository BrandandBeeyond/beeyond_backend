const express = require("express");
const notificationRouter = express.Router();

notificationRouter.post("/save-token", async (req, res) => {
  const { userId, token } = req.body;

  if (!userId || !token) {
    return res.status(400).json({ message: "Missing data" });
  }

  await User.findByIdAndUpdate(userId, { fcmToken: token });

  res.status(200).json({ message: "Token saved" });
});

module.exports = notificationRouter;