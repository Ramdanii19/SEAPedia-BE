import Address from "../models/address.model.js";
import { ApiError } from "../utils/ApiError.js";

export async function listAddresses(buyerId) {
  return Address.find({ buyer: buyerId }).sort({ isDefault: -1, createdAt: -1 });
}

export async function updateAddress({ addressId, buyerId, updates }) {
  const address = await Address.findById(addressId);
  if (!address) throw new ApiError(404, "Address not found");
  if (!address.buyer.equals(buyerId)) throw new ApiError(403, "You do not own this address");

  if (updates.isDefault) {
    await Address.updateMany({ buyer: buyerId, isDefault: true }, { $set: { isDefault: false } });
  }

  Object.assign(address, updates);
  await address.save();
  return address;
}

export async function deleteAddress({ addressId, buyerId }) {
  const address = await Address.findById(addressId);
  if (!address) throw new ApiError(404, "Address not found");
  if (!address.buyer.equals(buyerId)) throw new ApiError(403, "You do not own this address");

  await address.deleteOne();
}

export async function createAddress({ buyerId, recipientName, phone, addressDetail, isDefault = false }) {
  if (isDefault) {
    await Address.updateMany({ buyer: buyerId, isDefault: true }, { $set: { isDefault: false } });
  }

  const address = await Address.create({ buyer: buyerId, recipientName, phone, addressDetail, isDefault });
  return address;
}
