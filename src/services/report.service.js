import Order from "../models/order.model.js";
import { ORDER_STATUS } from "../constants/enums.js";

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
