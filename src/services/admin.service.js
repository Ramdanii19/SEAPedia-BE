import User from "../models/user.model.js";
import Store from "../models/store.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import Voucher from "../models/voucher.model.js";
import Promo from "../models/promo.model.js";
import DeliveryJob from "../models/deliveryJob.model.js";

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
