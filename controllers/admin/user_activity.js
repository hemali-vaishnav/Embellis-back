const logger = require("../../logger");
const Cart = require("../../models/cart");
const Favorite = require("../../models/favorite");

exports.getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.find({ "items.0": { $exists: true } })
      .populate("user", "name email phone")
      .populate("items.product");

    const items = carts.flatMap((cart) =>
      cart.items.map((item) => ({
        _id: item._id,
        user: cart.user,
        product: item.product,
        quantity: item.quantity,
        size: item.size,
      }))
    );

    return res.status(200).json({
      message: "Carts fetched successfully",
      items,
    });
  } catch (error) {
    logger.error("Error in getAllCarts", error);
    return res.status(500).json({ message: "Error in getAllCarts", error: error.message });
  }
};

exports.getAllFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find()
      .populate("user", "name email phone")
      .populate("product")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Favorites fetched successfully",
      favorites,
    });
  } catch (error) {
    logger.error("Error in getAllFavorites", error);
    return res.status(500).json({ message: "Error in getAllFavorites", error: error.message });
  }
};
