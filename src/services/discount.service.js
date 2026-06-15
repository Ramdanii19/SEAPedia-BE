import Voucher from "../models/voucher.model.js";
import Promo from "../models/promo.model.js";
import { ApiError } from "../utils/ApiError.js";

export async function listVouchers({ page = 1, limit = 10 }) {
  const skip = (page - 1) * limit;
  const [vouchers, total] = await Promise.all([
    Voucher.find().sort({ expiryDate: 1 }).skip(skip).limit(limit),
    Voucher.countDocuments(),
  ]);
  return { vouchers, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

export async function getVoucherByCode(code) {
  const voucher = await Voucher.findOne({ code: code.toUpperCase() });
  if (!voucher) throw new ApiError(404, "Voucher not found");
  return voucher;
}

export async function listPromos({ page = 1, limit = 10 }) {
  const skip = (page - 1) * limit;
  const [promos, total] = await Promise.all([
    Promo.find().sort({ expiryDate: 1 }).skip(skip).limit(limit),
    Promo.countDocuments(),
  ]);
  return { promos, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

export async function getPromoByCode(code) {
  const promo = await Promo.findOne({ code: code.toUpperCase() });
  if (!promo) throw new ApiError(404, "Promo not found");
  return promo;
}

export async function createVoucher({ name, code, discountType, discountValue, remainingUsage, expiryDate }) {
  try {
    const voucher = await Voucher.create({ name, code: code.toUpperCase(), discountType, discountValue, remainingUsage, expiryDate });
    return voucher;
  } catch (err) {
    if (err.code === 11000) throw new ApiError(409, "Voucher code already exists");
    throw err;
  }
}

export async function createPromo({ name, code, discountType, discountValue, expiryDate }) {
  try {
    const promo = await Promo.create({ name, code: code.toUpperCase(), discountType, discountValue, expiryDate });
    return promo;
  } catch (err) {
    if (err.code === 11000) throw new ApiError(409, "Promo code already exists");
    throw err;
  }
}
