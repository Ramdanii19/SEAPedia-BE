import Voucher from "../models/voucher.model.js";
import Promo from "../models/promo.model.js";
import { ApiError } from "../utils/ApiError.js";

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
