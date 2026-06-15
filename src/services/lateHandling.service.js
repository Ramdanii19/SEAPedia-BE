import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Wallet from "../models/wallet.model.js";
import WalletTransaction from "../models/walletTransaction.model.js";
import { ORDER_STATUS, WALLET_TX_TYPE } from "../constants/enums.js";
import { getCurrentTime } from "./systemTime.service.js";
import { getOrCreateWallet } from "./wallet.service.js";

export async function processLateOrders() {
  const now = await getCurrentTime();
  const terminalStatuses = [ORDER_STATUS.COMPLETED, ORDER_STATUS.RETURNED];

  const lateOrders = await Order.find({
    status: { $nin: terminalStatuses },
    expiredAt: { $lt: now, $ne: null },
  });

  const results = { processed: 0, skipped: 0, errors: [] };

  for (const order of lateOrders) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const wallet = await getOrCreateWallet(order.buyer);

      await Wallet.findByIdAndUpdate(
        wallet._id,
        { $inc: { balance: order.finalTotal } },
        { session }
      );

      await WalletTransaction.create(
        [{
          wallet: wallet._id,
          type: WALLET_TX_TYPE.REFUND,
          amount: order.finalTotal,
          description: `Refund otomatis order #${order._id} — pengiriman melewati SLA (${order.deliveryMethod})`,
        }],
        { session }
      );

      order.pushStatus(
        ORDER_STATUS.RETURNED,
        `Auto-returned: order melewati SLA ${order.deliveryMethod}. Saldo Rp${order.finalTotal.toLocaleString("id-ID")} dikembalikan ke buyer.`
      );
      order.returnedAt = now;
      await order.save({ session });

      await session.commitTransaction();
      results.processed++;
    } catch (err) {
      await session.abortTransaction();
      results.errors.push({ orderId: order._id, error: err.message });
      results.skipped++;
    } finally {
      session.endSession();
    }
  }

  return results;
}
