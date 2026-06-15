import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ORDER_STATUS, DELIVERY_METHOD } from "../constants/enums.js";
import { SLA_HOURS } from "../constants/config.js";
import { advanceTime, getCurrentTime } from "./systemTime.service.js";
import Store from "../models/store.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import Voucher from "../models/voucher.model.js";
import Promo from "../models/promo.model.js";
import DeliveryJob from "../models/deliveryJob.model.js";

// Order dianggap overdue jika: status bukan COMPLETED/RETURNED
// DAN waktu sejak createdAt melebihi SLA_HOURS[deliveryMethod].
// Dipakai penuh di Branch 13 (notifikasi & auto-escalation).
export async function simulateNextDay() {
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const newTime = await advanceTime(ONE_DAY_MS);

  // Periksa order yang kini melewati SLA setelah waktu dimajukan
  const terminalStatuses = [ORDER_STATUS.COMPLETED, ORDER_STATUS.RETURNED];
  const now = newTime;

  const slaConditions = Object.values(DELIVERY_METHOD).map((method) => ({
    deliveryMethod: method,
    createdAt: { $lt: new Date(now - SLA_HOURS[method] * 60 * 60 * 1000) },
  }));

  const overdueCount = await Order.countDocuments({
    status: { $nin: terminalStatuses },
    $or: slaConditions,
  });

  return { newSystemTime: newTime, overdueCount };
}

export async function listOverdueOrders({ page = 1, limit = 20 }) {
  const terminalStatuses = [ORDER_STATUS.COMPLETED, ORDER_STATUS.RETURNED];
  const now = new Date();

  // Build per-method SLA deadline conditions
  const slaConditions = Object.values(DELIVERY_METHOD).map((method) => ({
    deliveryMethod: method,
    createdAt: { $lt: new Date(now - SLA_HOURS[method] * 60 * 60 * 1000) },
  }));

  const filter = {
    status: { $nin: terminalStatuses },
    $or: slaConditions,
  };

  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .select("-statusHistory -items")
      .populate("buyer", "fullName email")
      .populate("store", "storeName")
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  return { orders, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

export async function getVoucherDetail(id) {
  const voucher = await Voucher.findById(id);
  if (!voucher) throw new ApiError(404, "Voucher not found");
  return voucher;
}

export async function updateVoucher(id, updates) {
  const voucher = await Voucher.findById(id);
  if (!voucher) throw new ApiError(404, "Voucher not found");
  if (updates.code) updates.code = updates.code.toUpperCase();
  Object.assign(voucher, updates);
  try {
    await voucher.save();
    return voucher;
  } catch (err) {
    if (err.code === 11000) throw new ApiError(409, "Voucher code already exists");
    throw err;
  }
}

export async function deleteVoucher(id) {
  const voucher = await Voucher.findByIdAndDelete(id);
  if (!voucher) throw new ApiError(404, "Voucher not found");
}

export async function getPromoDetail(id) {
  const promo = await Promo.findById(id);
  if (!promo) throw new ApiError(404, "Promo not found");
  return promo;
}

export async function updatePromo(id, updates) {
  const promo = await Promo.findById(id);
  if (!promo) throw new ApiError(404, "Promo not found");
  if (updates.code) updates.code = updates.code.toUpperCase();
  Object.assign(promo, updates);
  try {
    await promo.save();
    return promo;
  } catch (err) {
    if (err.code === 11000) throw new ApiError(409, "Promo code already exists");
    throw err;
  }
}

export async function deletePromo(id) {
  const promo = await Promo.findByIdAndDelete(id);
  if (!promo) throw new ApiError(404, "Promo not found");
}

export async function listVouchers({ page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;
  const [vouchers, total] = await Promise.all([
    Voucher.find().sort({ expiryDate: 1 }).skip(skip).limit(limit),
    Voucher.countDocuments(),
  ]);
  return { vouchers, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

export async function listPromos({ page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;
  const [promos, total] = await Promise.all([
    Promo.find().sort({ expiryDate: 1 }).skip(skip).limit(limit),
    Promo.countDocuments(),
  ]);
  return { promos, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

export async function listDeliveryJobs({ page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;
  const [jobs, total] = await Promise.all([
    DeliveryJob.find()
      .populate("driver", "fullName email")
      .populate({ path: "order", select: "status deliveryMethod store", populate: { path: "store", select: "storeName" } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    DeliveryJob.countDocuments(),
  ]);
  return { jobs, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

export async function listUsers({ page = 1, limit = 10 }) {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find().select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(),
  ]);
  return { users, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

export async function listProducts({ page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;
  const [products, total] = await Promise.all([
    Product.find()
      .populate("store", "storeName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(),
  ]);
  return { products, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

export async function listOrders({ page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find()
      .select("-statusHistory -items")
      .populate("buyer", "fullName email")
      .populate("store", "storeName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(),
  ]);
  return { orders, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

export async function listStores({ page = 1, limit = 10 }) {
  const skip = (page - 1) * limit;
  const [stores, total] = await Promise.all([
    Store.find()
      .populate("seller", "fullName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Store.countDocuments(),
  ]);
  return { stores, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}
