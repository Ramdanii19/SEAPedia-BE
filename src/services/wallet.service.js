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
