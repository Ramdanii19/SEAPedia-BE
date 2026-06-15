import Order from "../models/order.model.js";
import Store from "../models/store.model.js";
import { ApiError } from "../utils/ApiError.js";

export async function getSellerOrders({ sellerId, page = 1, limit = 10 }) {
  const store = await Store.findOne({ seller: sellerId });
  if (!store) throw new ApiError(404, "You don't have a store yet");

  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find({ store: store._id })
      .select("-statusHistory")
      .populate("buyer", "fullName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments({ store: store._id }),
  ]);

  return {
    orders,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

export async function listMyOrders({ buyerId, page = 1, limit = 10 }) {
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find({ buyer: buyerId })
      .select("-statusHistory")
      .populate("store", "storeName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments({ buyer: buyerId }),
  ]);

  return {
    orders,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

export async function getOrderDetail({ orderId, buyerId }) {
  const order = await Order.findById(orderId)
    .populate("store", "storeName addressDetail")
    .populate("items.product", "name imageUrl");

  if (!order) throw new ApiError(404, "Order not found");
  if (!order.buyer.equals(buyerId)) throw new ApiError(403, "Access denied");

  return order;
}
