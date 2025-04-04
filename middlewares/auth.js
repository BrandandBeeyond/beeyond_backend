const jwt = require("jsonwebtoken");
const asyncErrorHandler = require("../middlewares/asyncErrorHandler");

const isAuthenticatedUser = asyncErrorHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log("Auth Header:", authHeader); // Debugging step

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "Please login to access" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodedData.id);
    next();
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
});

module.exports = { isAuthenticatedUser };
