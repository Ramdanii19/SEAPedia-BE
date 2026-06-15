import Store from "../models/store.model.js";
import { ApiError } from "../utils/ApiError.js";

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
