const logger = require("../logger");
const Favorite = require("../models/favorite");

exports.getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id })
      .populate("product")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Favorites fetched successfully",
      favorites,
    });
  } catch (error) {
    logger.error("Error in getFavorites", error);
    return res.status(500).json({ message: "Error in getFavorites", error: error.message });
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const { productId } = req.params;

    const existing = await Favorite.findOne({ user: req.user.id, product: productId });

    if (existing) {
      await existing.deleteOne();
      return res.status(200).json({ message: "Removed from favorites", liked: false });
    }

    await Favorite.create({ user: req.user.id, product: productId });
    return res.status(200).json({ message: "Added to favorites", liked: true });
  } catch (error) {
    logger.error("Error in toggleFavorite", error);
    return res.status(500).json({ message: "Error in toggleFavorite", error: error.message });
  }
};
