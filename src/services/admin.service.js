import User from "../models/user.model.js";
import Store from "../models/store.model.js";

export async function listUsers({ page = 1, limit = 10 }) {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find().select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(),
  ]);
  return { users, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
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
