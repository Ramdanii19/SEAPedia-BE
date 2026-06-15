import mongoose from "mongoose";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Address from "../models/address.model.js";
import Order from "../models/order.model.js";
import Wallet from "../models/wallet.model.js";
import WalletTransaction from "../models/walletTransaction.model.js";
import { ApiError } from "../utils/ApiError.js";
import { calculateOrderTotals } from "../utils/priceCalculator.js";
import { getOrCreateWallet } from "./wallet.service.js";
import { WALLET_TX_TYPE } from "../constants/enums.js";

export async function checkout({ buyerId, addressId, deliveryMethod }) {
  const [cart, address, wallet] = await Promise.all([
    Cart.findOne({ buyer: buyerId }).populate("items.product", "name price stock store"),
    Address.findById(addressId),
    getOrCreateWallet(buyerId),
  ]);

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }
  if (!address || !address.buyer.equals(buyerId)) {
    throw new ApiError(400, "Invalid address");
  }

  // Validate stock for all items
  for (const item of cart.items) {
    if (item.quantity > item.product.stock) {
      throw new ApiError(400, `Stok tidak cukup untuk produk "${item.product.name}". Tersedia: ${item.product.stock}`);
    }
  }

  const totals = calculateOrderTotals({
    items: cart.items.map((i) => ({ price: i.product.price, quantity: i.quantity })),
    deliveryMethod,
  });

  if (wallet.balance < totals.finalTotal) {
    throw new ApiError(400, `Saldo dompet tidak cukup. Saldo: Rp${wallet.balance.toLocaleString("id-ID")}, dibutuhkan: Rp${totals.finalTotal.toLocaleString("id-ID")}`);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Deduct stock
    for (const item of cart.items) {
      await Product.findOneAndUpdate(
        { _id: item.product._id, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { session }
      ).orFail(new ApiError(400, `Stok "${item.product.name}" habis saat proses checkout`));
    }

    // Deduct wallet balance
    await Wallet.findOneAndUpdate(
      { _id: wallet._id, balance: { $gte: totals.finalTotal } },
      { $inc: { balance: -totals.finalTotal } },
      { session }
    ).orFail(new ApiError(400, "Saldo dompet tidak mencukupi"));

    // Record wallet transaction
    await WalletTransaction.create(
      [{ wallet: wallet._id, type: WALLET_TX_TYPE.PAYMENT, amount: totals.finalTotal, description: "Pembayaran order" }],
      { session }
    );

    // Build order
    const orderItems = cart.items.map((item) => ({
      product:     item.product._id,
      productName: item.product.name,
      price:       item.product.price,
      quantity:    item.quantity,
      subtotal:    item.product.price * item.quantity,
    }));

    const [order] = await Order.create(
      [{
        buyer:                buyerId,
        store:                cart.store,
        shippingRecipientName: address.recipientName,
        shippingPhone:        address.phone,
        shippingAddress:      address.addressDetail,
        items:                orderItems,
        deliveryMethod,
        ...totals,
      }],
      { session }
    );

    order.pushStatus(order.status, "Order placed");
    await order.save({ session });

    // Clear cart
    await Cart.findOneAndUpdate(
      { buyer: buyerId },
      { $set: { items: [], store: null } },
      { session }
    );

    await session.commitTransaction();
    return order;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}
