const logger = require("../logger");
const Cart = require("../models/cart");

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");

    return res.status(200).json({
      message: "Cart fetched successfully",
      items: cart?.items || [],
    });
  } catch (error) {
    logger.error("Error in getCart", error);
    return res.status(500).json({ message: "Error in getCart", error: error.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity, size } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    const cart = await getOrCreateCart(req.user.id);
    const qty = quantity && quantity > 0 ? quantity : 1;

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId && (item.size || "") === (size || "")
    );

    if (existingItem) {
      existingItem.quantity += qty;
    } else {
      cart.items.push({ product: productId, quantity: qty, size });
    }

    await cart.save();
    await cart.populate("items.product");

    return res.status(200).json({ message: "Added to cart", items: cart.items });
  } catch (error) {
    logger.error("Error in addToCart", error);
    return res.status(500).json({ message: "Error in addToCart", error: error.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate("items.product");

    return res.status(200).json({ message: "Cart item updated", items: cart.items });
  } catch (error) {
    logger.error("Error in updateCartItem", error);
    return res.status(500).json({ message: "Error in updateCartItem", error: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    await cart.save();
    await cart.populate("items.product");

    return res.status(200).json({ message: "Removed from cart", items: cart.items });
  } catch (error) {
    logger.error("Error in removeFromCart", error);
    return res.status(500).json({ message: "Error in removeFromCart", error: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    return res.status(200).json({ message: "Cart cleared", items: [] });
  } catch (error) {
    logger.error("Error in clearCart", error);
    return res.status(500).json({ message: "Error in clearCart", error: error.message });
  }
};
