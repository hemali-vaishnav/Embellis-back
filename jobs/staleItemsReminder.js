const cron = require("node-cron");
const logger = require("../logger");
const Cart = require("../models/cart");
const Favorite = require("../models/favorite");
const { sendStaleItemsReminderMail } = require("../utils/mailer");

const REMINDER_AFTER_DAYS = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const daysSince = (date) => Math.floor((Date.now() - new Date(date).getTime()) / MS_PER_DAY);

const checkStaleCartAndWishlistItems = async () => {
  const cutoff = new Date(Date.now() - REMINDER_AFTER_DAYS * MS_PER_DAY);

  const usersToNotify = new Map();
  const cartItemIdsToMark = [];
  const favoriteIdsToMark = [];

  const carts = await Cart.find({
    "items.createdAt": { $lte: cutoff },
    "items.reminderSent": { $ne: true },
  })
    .populate("user")
    .populate("items.product");

  for (const cart of carts) {
    if (!cart.user || !cart.user.email) continue;

    for (const item of cart.items) {
      if (item.reminderSent || !item.product) continue;
      if (new Date(item.createdAt) > cutoff) continue;

      cartItemIdsToMark.push(item._id);

      const entry = usersToNotify.get(cart.user.id) || { user: cart.user, items: [] };
      entry.items.push({
        name: item.product.product_name,
        image: item.product.image_1 || item.product.image_2 || "",
        source: "cart",
        days: daysSince(item.createdAt),
      });
      usersToNotify.set(cart.user.id, entry);
    }
  }

  const favorites = await Favorite.find({
    createdAt: { $lte: cutoff },
    reminderSent: { $ne: true },
  })
    .populate("user")
    .populate("product");

  for (const favorite of favorites) {
    if (!favorite.user || !favorite.user.email || !favorite.product) continue;

    favoriteIdsToMark.push(favorite._id);

    const entry = usersToNotify.get(favorite.user.id) || { user: favorite.user, items: [] };
    entry.items.push({
      name: favorite.product.product_name,
      image: favorite.product.image_1 || favorite.product.image_2 || "",
      source: "wishlist",
      days: daysSince(favorite.createdAt),
    });
    usersToNotify.set(favorite.user.id, entry);
  }

  const sentCartItemIds = [];
  const sentFavoriteIds = [];

  for (const { user, items } of usersToNotify.values()) {
    try {
      await sendStaleItemsReminderMail(user.email, user.name, items);
      logger.info(`Stale items reminder sent to ${user.email} (${items.length} item(s))`);
    } catch (error) {
      logger.error(`Failed to send stale items reminder to ${user.email}`, error);
    }
  }

  if (cartItemIdsToMark.length) {
    await Cart.updateMany(
      { "items._id": { $in: cartItemIdsToMark } },
      { $set: { "items.$[item].reminderSent": true } },
      { arrayFilters: [{ "item._id": { $in: cartItemIdsToMark } }] }
    );
  }

  if (favoriteIdsToMark.length) {
    await Favorite.updateMany(
      { _id: { $in: favoriteIdsToMark } },
      { $set: { reminderSent: true } }
    );
  }

  logger.info(
    `Stale items reminder job done: ${usersToNotify.size} user(s) notified, ${cartItemIdsToMark.length} cart item(s) and ${favoriteIdsToMark.length} wishlist item(s) marked.`
  );
};

const scheduleStaleItemsReminderJob = () => {
  // Runs once a day at 9:00 AM server time.
  cron.schedule("0 9 * * *", () => {
    checkStaleCartAndWishlistItems().catch((error) => {
      logger.error("Stale items reminder job failed", error);
    });
  });
};

module.exports = { scheduleStaleItemsReminderJob, checkStaleCartAndWishlistItems };
