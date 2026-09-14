require("dotenv").config();
const mongoose = require("mongoose");
const Cart = require("../models/cart");

async function run() {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });

  const carts = await Cart.find({ "items.0": { $exists: true } }).lean();
  let updatedItems = 0;

  for (const cart of carts) {
    for (const item of cart.items) {
      if (item.createdAt) continue;

      await Cart.collection.updateOne(
        { _id: cart._id, "items._id": item._id },
        {
          $set: {
            "items.$.createdAt": cart.createdAt,
            "items.$.updatedAt": cart.updatedAt || cart.createdAt,
          },
        }
      );
      updatedItems++;
    }
  }

  console.log(`Backfilled timestamps on ${updatedItems} cart item(s)`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Backfill failed", err);
  process.exit(1);
});
