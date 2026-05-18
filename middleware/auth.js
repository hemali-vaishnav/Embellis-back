const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const logger = require("../logger");
const User = require("../models/user_signup");
const LogoutToken = require("../models/logout_token");
require("dotenv").config();

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

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
    const loggedOutToken = await LogoutToken.findOne({ tokenHash: hashToken(token) });

    if (loggedOutToken) {
      logger.error("Logged out token used");
      return res.status(401).json({
        message: "Token has been logged out",
      });
    }

    const user = await User.findById(decoded.id).select("_id name role");

    if (!user) {
      logger.error("Authorized user not found");
      return res.status(401).json({
        message: "User not found",
      });
    }

    req.user = {
      id: user._id,
      username: user.name,
      role: user.role,
      iat: decoded.iat,
      exp: decoded.exp,
    };
    req.token = token;
    next();
  } catch (error) {
    logger.error("Unauthorized access", error);
    return res.status(401).json({
      message: "Invalid or expired token",
      error: error.message
    });
  }
};
