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
    },
    size: {
      type: String,
      enum: ["S", "M", "L", "XL", "XXL"],
    },
    color: {
      type: String,
    },
    print_placement: {
      type: String,
      enum: ["front", "back", "all_over"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    price: {
      type: Number,
      required: true,
    },
    note: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Custom", customSchema);
