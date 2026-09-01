const logger = require("../logger");
const Product = require("../models/admin/product_catalog");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const exactCaseInsensitive = (value) => ({ $regex: `^${escapeRegex(value)}$`, $options: "i" });

exports.getProducts = async (req, res) => {
  try {
    const { category, sub_category, gender } = req.query;
    const match = {};
    if (category) match.category = exactCaseInsensitive(category);
    if (sub_category) match.sub_category = exactCaseInsensitive(sub_category);
    if (gender) match.gender = exactCaseInsensitive(gender);

    const catalog = await Product.aggregate([
      { $match: match },
      {
        $sort: {
          product_name: 1,
          category: 1,
        },
      },
      {
        $group: {
          _id: "$category",
          products: {
            $push: {
              _id: "$_id",
              product_name: "$product_name",
              price: "$price",
              size: "$size",
              type: "$type",
              stock: "$stock",
              category: "$category",
              sub_category: "$sub_category",
              gender: "$gender",
              description: "$description",
              image_1: "$image_1",
              image_2: "$image_2",
              is_trending: "$is_trending",
              is_best_seller: "$is_best_seller",
              createdAt: "$createdAt",
              updatedAt: "$updatedAt",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          products: 1,
        },
      },
      {
        $sort: {
          category: 1,
        },
      },
    ]);

    return res.status(200).json({
      message: "Products fetched successfully",
      data: catalog,
    });
  } catch (err) {
    logger.error("Error in getProducts", err);

    return res.status(500).json({
      message: "Error in getProducts",
      error: err.message,
    });
  }
};

const FEATURED_FLAG_FIELDS = {
  trending: "is_trending",
  best_seller: "is_best_seller",
};

exports.getFeaturedProducts = async (req, res) => {
  try {
    const { flag, limit } = req.query;
    const field = FEATURED_FLAG_FIELDS[flag];

    if (!field) {
      return res.status(400).json({
        message: "Invalid flag. Use 'trending' or 'best_seller'.",
      });
    }

    const products = await Product.find({ [field]: true })
      .sort({ createdAt: -1 })
      .limit(Number(limit) || 10);

    return res.status(200).json({
      message: "Featured products fetched successfully",
      data: products,
    });
  } catch (err) {
    logger.error("Error in getFeaturedProducts", err);

    return res.status(500).json({
      message: "Error in getFeaturedProducts",
      error: err.message,
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      message: "Product fetched successfully",
      data: product,
    });
  } catch (err) {
    logger.error("Error in getProductById", err);

    return res.status(500).json({
      message: "Error in getProductById",
      error: err.message,
    });
  }
};
