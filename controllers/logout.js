const crypto = require("crypto");
const logger = require("../logger");
const LogoutToken = require("../models/logout_token");

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

exports.logout = async (req, res) => {
  try {
    if (!req.token || !req.user || !req.user.exp) {
      logger.error("Logout token data is missing");
      return res.status(400).json({ message: "Unable to logout" });
    }

    const expiresAt = new Date(req.user.exp * 1000);
    const tokenHash = hashToken(req.token);

    if (expiresAt <= new Date()) {
      return res.status(401).json({ message: "Token is already expired" });
    }

    await LogoutToken.updateOne(
      { tokenHash },
      {
        tokenHash,
        userId: req.user.id,
        expiresAt,
      },
      { upsert: true }
    );

    logger.info("User logged out successfully");
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    logger.error("Error in logout", error);
    return res.status(500).json({
      message: "Error in logout",
      error: error.message,
    });
  }
};
