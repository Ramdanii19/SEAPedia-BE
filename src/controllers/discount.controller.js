import * as discountService from "../services/discount.service.js";
import { sendSuccess } from "../utils/response.js";

export async function createVoucher(req, res, next) {
  try {
    const { name, code, discountType, discountValue, remainingUsage, expiryDate } = req.body;
    const voucher = await discountService.createVoucher({ name, code, discountType, discountValue, remainingUsage, expiryDate });
    return sendSuccess(res, { voucher }, "Voucher created", 201);
  } catch (err) {
    next(err);
  }
}

export async function createPromo(req, res, next) {
  try {
    const { name, code, discountType, discountValue, expiryDate } = req.body;
    const promo = await discountService.createPromo({ name, code, discountType, discountValue, expiryDate });
    return sendSuccess(res, { promo }, "Promo created", 201);
  } catch (err) {
    next(err);
  }
}
