import Wallet from "../models/wallet.model.js";
import WalletTransaction from "../models/walletTransaction.model.js";
import { WALLET_TX_TYPE } from "../constants/enums.js";

export async function getOrCreateWallet(userId) {
  const wallet = await Wallet.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, balance: 0 } },
    { new: true, upsert: true }
  );
  return wallet;
}

export async function getTransactions({ userId, page = 1, limit = 10 }) {
  const wallet = await getOrCreateWallet(userId);
  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    WalletTransaction.find({ wallet: wallet._id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    WalletTransaction.countDocuments({ wallet: wallet._id }),
  ]);

  return {
    transactions,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

export async function topUp({ userId, amount }) {
  const wallet = await Wallet.findOneAndUpdate(
    { user: userId },
    { $inc: { balance: amount }, $setOnInsert: { user: userId } },
    { new: true, upsert: true }
  );

  await WalletTransaction.create({
    wallet: wallet._id,
    type: WALLET_TX_TYPE.TOPUP,
    amount,
    description: `Top up Rp${amount.toLocaleString("id-ID")}`,
  });

  return wallet;
}

export async function getWallet(userId) {
  return getOrCreateWallet(userId);
}
