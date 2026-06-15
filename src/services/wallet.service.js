import Wallet from "../models/wallet.model.js";

export async function getOrCreateWallet(userId) {
  const wallet = await Wallet.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, balance: 0 } },
    { new: true, upsert: true }
  );
  return wallet;
}

export async function getWallet(userId) {
  return getOrCreateWallet(userId);
}
