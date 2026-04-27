const mongoose = require("mongoose");

const customSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    file: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      unique: true,
    },
    size: {
      type: String,
      enum: ["S", "M", "L", "XL", "XXL"],
    },
    print_placement: {
      type: String,
      enum: ["front", "back", "full_pattern", "sleeve"],
      required: true,
    },
    quality: {
      type: Number,
      required: true,
    },
    note: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Custom", customSchema);
