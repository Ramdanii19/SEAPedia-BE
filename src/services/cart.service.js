import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";

export async function addToCart({ buyerId, productId, quantity }) {
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  const cart = await Cart.findOneAndUpdate(
    { buyer: buyerId },
    { $setOnInsert: { buyer: buyerId, store: null, items: [] } },
    { new: true, upsert: true }
  );

  if (!cart.store) {
    cart.store = product.store;
  } else if (!cart.store.equals(product.store)) {
    throw new ApiError(409, "Produk dari toko berbeda. Kosongkan keranjang dulu sebelum menambah produk dari toko lain.");
  }

  const existing = cart.items.find((item) => item.product.equals(productId));
  const newQuantity = existing ? existing.quantity + quantity : quantity;

  if (newQuantity > product.stock) {
    throw new ApiError(400, `Stok tidak cukup. Tersedia: ${product.stock}`);
  }

  if (existing) {
    existing.quantity = newQuantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  return cart.populate([{ path: "store", select: "storeName" }, { path: "items.product", select: "name price imageUrl" }]);
}
