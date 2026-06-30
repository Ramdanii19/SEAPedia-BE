import Wishlist from "../models/wishlist.model.js";

export async function getWishlist(userId) {
  const wishlist = await Wishlist.findOne({ user: userId }).populate({
    path: "products",
    populate: { path: "store", select: "storeName" },
  });
  return { products: wishlist?.products ?? [] };
}

export async function toggleWishlist(userId, productId) {
  let wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [productId] });
    return { added: true };
  }

  const idx = wishlist.products.findIndex((p) => p.toString() === productId);
  if (idx === -1) {
    wishlist.products.push(productId);
    await wishlist.save();
    return { added: true };
  } else {
    wishlist.products.splice(idx, 1);
    await wishlist.save();
    return { added: false };
  }
}
