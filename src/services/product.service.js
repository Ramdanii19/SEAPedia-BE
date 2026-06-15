import Product from "../models/product.model.js";
import Store from "../models/store.model.js";
import { ApiError } from "../utils/ApiError.js";

export async function createProduct({ sellerId, name, description, price, stock, imageUrl }) {
  const store = await Store.findOne({ seller: sellerId });
  if (!store) throw new ApiError(404, "You don't have a store yet");

  const product = await Product.create({
    store: store._id,
    name,
    description,
    price,
    stock,
    imageUrl,
  });

  return product;
}
