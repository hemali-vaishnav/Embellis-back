const jwt = require("jsonwebtoken");
const logger = require("../logger");
const User = require("../models/user_signup");
require("dotenv").config();

exports.authorize = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      logger.error("Authorization token is missing");
      return res.status(401).json({
        message: "Authorization token is required",
      });
    }

    const [scheme, token] = authHeader.trim().split(/\s+/);

    if (scheme !== "Bearer" || !token) {
      logger.error("Bearer token is malformed");
      return res.status(401).json({
        message: "Authorization header must be in the format: Bearer <token>",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("_id name");

    if (!user) {
      logger.error("Authorized user not found");
      return res.status(401).json({
        message: "User not found",
      });
    }

    req.user = {
      id: user._id,
      username: user.name,
      iat: decoded.iat,
      exp: decoded.exp,
    };
    next();
  } catch (error) {
    logger.error("Unauthorized access", error);
    return res.status(401).json({
      message: "Invalid or expired token",
      error: error.message
    });
  }
};
