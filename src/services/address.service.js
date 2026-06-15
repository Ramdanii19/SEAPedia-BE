import Address from "../models/address.model.js";

export async function createAddress({ buyerId, recipientName, phone, addressDetail, isDefault = false }) {
  if (isDefault) {
    await Address.updateMany({ buyer: buyerId, isDefault: true }, { $set: { isDefault: false } });
  }

  const address = await Address.create({ buyer: buyerId, recipientName, phone, addressDetail, isDefault });
  return address;
}
