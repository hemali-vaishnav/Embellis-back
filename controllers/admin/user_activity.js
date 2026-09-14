const moment = require("moment");
const logger = require("../../logger");
const Cart = require("../../models/cart");
const Favorite = require("../../models/favorite");

const DATE_TIME_FORMAT = "DD-MM-YYYY HH:mm:ss";
const formatDateTime = (date) => (date ? moment(date).format(DATE_TIME_FORMAT) : null);

exports.getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.find({ "items.0": { $exists: true } })
      .populate("user", "name email phone")
      .populate("items.product")
      .lean();

    const items = carts.flatMap((cart) =>
      cart.items.map((item) => ({
        _id: item._id,
        user: cart.user,
        product: item.product,
        quantity: item.quantity,
        size: item.size,
        createdAt: formatDateTime(item.createdAt),
        updatedAt: formatDateTime(item.updatedAt),
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
      .sort({ createdAt: -1 })
      .lean();

    const formatted = favorites.map((favorite) => ({
      ...favorite,
      createdAt: formatDateTime(favorite.createdAt),
      updatedAt: formatDateTime(favorite.updatedAt),
    }));

    return res.status(200).json({
      message: "Favorites fetched successfully",
      favorites: formatted,
    });
  } catch (error) {
    logger.error("Error in getAllFavorites", error);
    return res.status(500).json({ message: "Error in getAllFavorites", error: error.message });
  }
};
