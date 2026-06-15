import Order from "../models/order.model.js";
import Store from "../models/store.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ORDER_STATUS } from "../constants/enums.js";

export async function getSellerRevenue(sellerId) {
  const store = await Store.findOne({ seller: sellerId });
  if (!store) throw new ApiError(404, "You don't have a store yet");

  const orders = await Order.find({ store: store._id })
    .select("status subtotal discountAmount deliveryFee ppnAmount finalTotal createdAt")
    .sort({ createdAt: -1 });

  const countByStatus = Object.values(ORDER_STATUS).reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
  orders.forEach((o) => { countByStatus[o.status]++; });

  const completedOrders = orders.filter((o) => o.status === ORDER_STATUS.COMPLETED);
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.subtotal - o.discountAmount, 0);

  const orderSummary = orders.map((o) => ({
    orderId:    o._id,
    status:     o.status,
    subtotal:   o.subtotal,
    discount:   o.discountAmount,
    finalTotal: o.finalTotal,
    createdAt:  o.createdAt,
  }));

  return {
    storeName: store.storeName,
    totals: {
      totalRevenue,
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
    },
    countByStatus,
    orders: orderSummary,
  };
}

export async function getBuyerSpending(buyerId) {
  const orders = await Order.find({ buyer: buyerId })
    .select("status subtotal discountAmount deliveryFee ppnAmount finalTotal createdAt store")
    .populate("store", "storeName")
    .sort({ createdAt: -1 });

  const completedOrders = orders.filter((o) => o.status === ORDER_STATUS.COMPLETED);

  const totals = completedOrders.reduce(
    (acc, o) => {
      acc.totalSpent     += o.finalTotal;
      acc.totalDiscount  += o.discountAmount;
      acc.totalDelivery  += o.deliveryFee;
      acc.totalPpn       += o.ppnAmount;
      return acc;
    },
    { totalSpent: 0, totalDiscount: 0, totalDelivery: 0, totalPpn: 0 }
  );

  const summary = orders.map((o) => ({
    orderId:        o._id,
    store:          o.store?.storeName ?? "-",
    status:         o.status,
    subtotal:       o.subtotal,
    discountAmount: o.discountAmount,
    deliveryFee:    o.deliveryFee,
    ppnAmount:      o.ppnAmount,
    finalTotal:     o.finalTotal,
    createdAt:      o.createdAt,
  }));

  return { totals, orders: summary };
}
