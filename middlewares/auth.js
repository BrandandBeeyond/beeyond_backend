const jwt = require("jsonwebtoken");
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');

const isAuthenticatedUser = asyncErrorHandler(async (req, res, next) => {
 

  const {token} = req.cookies;


  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Please login to access" });
  }

  try {
   

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodedData.id);

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
});

module.exports = { isAuthenticatedUser };
