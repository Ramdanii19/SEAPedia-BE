import Order from "../models/order.model.js";
import Store from "../models/store.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ORDER_STATUS } from "../constants/enums.js";

export async function getSellerRevenue(sellerId) {
  const store = await Store.findOne({ seller: sellerId });
  if (!store) throw new ApiError(404, "You don't have a store yet");

  const orders = await Order.find({ store: store._id })
    .select("status subtotal discountAmount deliveryFee ppnAmount finalTotal createdAt buyer")
    .populate("buyer", "fullName")
    .sort({ createdAt: -1 });

  const countByStatus = Object.values(ORDER_STATUS).reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
  orders.forEach((o) => { countByStatus[o.status]++; });

  const completedOrders = orders.filter((o) => o.status === ORDER_STATUS.COMPLETED);
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.subtotal - o.discountAmount, 0);

  // Current month & previous month revenue
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth();
  const curMonthRevenue = completedOrders
    .filter((o) => {
      const d = new Date(o.createdAt);
      return d.getFullYear() === curYear && d.getMonth() === curMonth;
    })
    .reduce((sum, o) => sum + o.subtotal - o.discountAmount, 0);
  const prevMonth = curMonth === 0 ? 11 : curMonth - 1;
  const prevMonthYear = curMonth === 0 ? curYear - 1 : curYear;
  const prevMonthRevenue = completedOrders
    .filter((o) => {
      const d = new Date(o.createdAt);
      return d.getFullYear() === prevMonthYear && d.getMonth() === prevMonth;
    })
    .reduce((sum, o) => sum + o.subtotal - o.discountAmount, 0);

  // Last 6 months trend
  const MONTH_NAMES = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
    const mIdx = ((curMonth - 5 + i) % 12 + 12) % 12;
    const yIdx = curYear - Math.floor((5 - i + (11 - curMonth)) / 12);
    const revenue = completedOrders
      .filter((o) => {
        const d = new Date(o.createdAt);
        return d.getFullYear() === yIdx && d.getMonth() === mIdx;
      })
      .reduce((sum, o) => sum + o.subtotal - o.discountAmount, 0);
    return { month: MONTH_NAMES[mIdx], revenue };
  });

  const orderSummary = orders.map((o) => ({
    orderId:      o._id,
    buyerName:    o.buyer?.fullName ?? "-",
    status:       o.status,
    subtotal:     o.subtotal,
    discount:     o.discountAmount,
    finalTotal:   o.finalTotal,
    createdAt:    o.createdAt,
  }));

  return {
    storeName: store.storeName,
    totals: {
      totalRevenue,
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      curMonthRevenue,
      prevMonthRevenue,
    },
    countByStatus,
    monthlyTrend,
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
