  const Custom = require("../models/custom");
  const logger = require("../logger");

  exports.createCustom = async (req, res) => {
    try {
      const file = req.file.filename;
      
      const { type, size, print_placement, quality, note } = req.body;
      
      if (!file || !type || !print_placement || !quality) {
        logger.error("Required custom fields are missing");
        return res.status(400).json({
          message: "file, type, print_placement and quality are required",
        });
      }

      const existingCustom = await Custom.findOne({ type });
      if (existingCustom) {
        logger.error("Custom type already exists");
        return res.status(400).json({
          message: "Custom type already exists",
        });
      }

      const custom = await Custom.create({
        user_id: req.user.id,
        file,
        type,
        size,
        print_placement,
        quality,
        note,
      });

      logger.info("Custom created successfully");
      return res.status(201).json({
        message: "Custom created successfully",
        custom,
      });
    } catch (error) {
      logger.error("Error in createCustom", error);
      return res.status(500).json({
        message: "Error in createCustom",
        error: error.message,
      });
    }
  };

  exports.getCustom = async (req, res) => {
    try {
      const custom = await Custom.find({ user_id: req.user.id }).sort({ createdAt: -1 });

      logger.info("Custom fetched successfully");
      return res.status(200).json({
        message: "Custom fetched successfully",
        custom,
      });
    } catch (error) {
      logger.error("Error in getCustom", error);
      return res.status(500).json({
        message: "Error in getCustom",
        error: error.message,
      });
    }
  };

  exports.getAllCustom = async (req, res) => {
    try {
      const custom = await Custom.find().sort({ createdAt: -1 });

      logger.info("All custom fetched successfully");
      return res.status(200).json({
        message: "All custom fetched successfully",
        custom,
      });
    } catch (error) {
      logger.error("Error in getAllCustom", error);
      return res.status(500).json({
        message: "Error in getAllCustom",
        error: error.message,
      });
    }
  };
