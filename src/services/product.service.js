import Product from "../models/product.model.js";
import Store from "../models/store.model.js";
import { ApiError } from "../utils/ApiError.js";

export async function listPublicProducts({ page = 1, limit = 10 }) {
  const skip = (page - 1) * limit;
  const [products, total] = await Promise.all([
    Product.find()
      .populate("store", "storeName addressDetail")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(),
  ]);

  return {
    products,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

export async function getProductDetail(id) {
  const product = await Product.findById(id).populate("store", "storeName description addressDetail");
  if (!product) throw new ApiError(404, "Product not found");
  return product;
}

export async function listMyProducts({ sellerId, page = 1, limit = 10 }) {
  const store = await Store.findOne({ seller: sellerId });
  if (!store) throw new ApiError(404, "You don't have a store yet");

  const skip = (page - 1) * limit;
  const [products, total] = await Promise.all([
    Product.find({ store: store._id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Product.countDocuments({ store: store._id }),
  ]);

  return {
    products,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

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
