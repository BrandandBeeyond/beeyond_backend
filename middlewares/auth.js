const jwt = require("jsonwebtoken");
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');

const isAuthenticatedUser = asyncErrorHandler(async (req, res, next) => {
 

  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
  console.log(token);

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Please login to access" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
});

module.exports = { isAuthenticatedUser };
