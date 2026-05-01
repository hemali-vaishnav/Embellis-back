const bcrypt = require("bcrypt");
const logger = require("../../logger");
const User = require("../../models/user_signup");

exports.makeAnAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      logger.error("All fields are required");
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.error("User already exists.");
      return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    logger.info("Admin created successfully");
    return res.status(201).json({
      message: "Admin created successfully",
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    logger.error("Error in makeAnAdmin", error);
    return res.status(500).json({
      message: "Error in makeAnAdmin",
      error: error.message,
    });
  }
};
