import mongoose from "mongoose";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Address from "../models/address.model.js";
import Order from "../models/order.model.js";
import Wallet from "../models/wallet.model.js";
import Voucher from "../models/voucher.model.js";
import WalletTransaction from "../models/walletTransaction.model.js";
import { ApiError } from "../utils/ApiError.js";
import { calculateOrderTotals } from "../utils/priceCalculator.js";
import { getOrCreateWallet } from "./wallet.service.js";
import { validateDiscount } from "./discount.service.js";
import { WALLET_TX_TYPE } from "../constants/enums.js";

// Aturan kombinasi diskon:
// Voucher dan promo BOLEH digabung dalam satu checkout.
// Keduanya dihitung terhadap subtotal yang sama (bukan berantai),
// sehingga total diskon = voucherAmount + promoAmount.
// Total diskon di-cap pada nilai subtotal agar finalTotal tidak negatif.
// Contoh: subtotal 100.000, voucher 10% (10.000) + promo FIXED 20.000 → diskon 30.000.

export async function checkout({ buyerId, addressId, deliveryMethod, voucherCode, promoCode }) {
  const [cart, address, wallet] = await Promise.all([
    Cart.findOne({ buyer: buyerId }).populate("items.product", "name price stock store"),
    Address.findById(addressId),
    getOrCreateWallet(buyerId),
  ]);

  if (!cart || cart.items.length === 0) throw new ApiError(400, "Cart is empty");
  if (!address || !address.buyer.equals(buyerId)) throw new ApiError(400, "Invalid address");

  for (const item of cart.items) {
    if (item.quantity > item.product.stock) {
      throw new ApiError(400, `Stok tidak cukup untuk produk "${item.product.name}". Tersedia: ${item.product.stock}`);
    }
  }

  const baseSubtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  let voucherResult = null;
  let promoResult = null;
  let totalDiscount = 0;

  if (voucherCode) {
    voucherResult = await validateDiscount({ code: voucherCode, type: "voucher", subtotal: baseSubtotal });
    totalDiscount += voucherResult.discountAmount;
  }
  if (promoCode) {
    promoResult = await validateDiscount({ code: promoCode, type: "promo", subtotal: baseSubtotal });
    totalDiscount += promoResult.discountAmount;
  }

  // Cap agar finalTotal tidak negatif
  totalDiscount = Math.min(totalDiscount, baseSubtotal);

  const totals = calculateOrderTotals({
    items: cart.items.map((i) => ({ price: i.product.price, quantity: i.quantity })),
    deliveryMethod,
    discount: totalDiscount,
  });

  if (wallet.balance < totals.finalTotal) {
    throw new ApiError(400, `Saldo dompet tidak cukup. Saldo: Rp${wallet.balance.toLocaleString("id-ID")}, dibutuhkan: Rp${totals.finalTotal.toLocaleString("id-ID")}`);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const item of cart.items) {
      await Product.findOneAndUpdate(
        { _id: item.product._id, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { session }
      ).orFail(new ApiError(400, `Stok "${item.product.name}" habis saat proses checkout`));
    }

    await Wallet.findOneAndUpdate(
      { _id: wallet._id, balance: { $gte: totals.finalTotal } },
      { $inc: { balance: -totals.finalTotal } },
      { session }
    ).orFail(new ApiError(400, "Saldo dompet tidak mencukupi"));

    await WalletTransaction.create(
      [{ wallet: wallet._id, type: WALLET_TX_TYPE.PAYMENT, amount: totals.finalTotal, description: "Pembayaran order" }],
      { session }
    );

    if (voucherResult) {
      await Voucher.findByIdAndUpdate(voucherResult.id, { $inc: { remainingUsage: -1 } }, { session });
    }

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
        voucher:              voucherResult?.id ?? null,
        promo:                promoResult?.id ?? null,
        ...totals,
      }],
      { session }
    );

    order.pushStatus(order.status, "Order placed");
    await order.save({ session });

    await Cart.findOneAndUpdate(
      { buyer: buyerId },
      { $set: { items: [], store: null } },
      { session }
    );

    await session.commitTransaction();

    return {
      order,
      summary: {
        subtotal:       totals.subtotal,
        discountAmount: totals.discountAmount,
        deliveryFee:    totals.deliveryFee,
        ppnAmount:      totals.ppnAmount,
        finalTotal:     totals.finalTotal,
      },
    };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}
