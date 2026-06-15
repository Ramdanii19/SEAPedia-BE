import Store from "../models/store.model.js";
import { ApiError } from "../utils/ApiError.js";

export async function getStoreById(id) {
  const store = await Store.findById(id).populate("seller", "fullName email");
  if (!store) throw new ApiError(404, "Store not found");
  return store;
}

export async function getMyStore(sellerId) {
  const store = await Store.findOne({ seller: sellerId });
  if (!store) throw new ApiError(404, "You don't have a store yet");
  return store;
}

export async function updateStore({ storeId, sellerId, updates }) {
  const store = await Store.findById(storeId);
  if (!store) throw new ApiError(404, "Store not found");
  if (!store.seller.equals(sellerId)) throw new ApiError(403, "You do not own this store");

  Object.assign(store, updates);

  try {
    await store.save();
    return store;
  } catch (err) {
    if (err.code === 11000) throw new ApiError(409, "Nama toko sudah dipakai");
    throw err;
  }
}

export async function createStore({ sellerId, storeName, description, addressDetail }) {
  const existing = await Store.findOne({ seller: sellerId });
  if (existing) {
    throw new ApiError(409, "You already have a store");
  }

  try {
    const store = await Store.create({ seller: sellerId, storeName, description, addressDetail });
    return store;
  } catch (err) {
    if (err.code === 11000) {
      throw new ApiError(409, "Nama toko sudah dipakai");
    }
    throw err;
  }
}
