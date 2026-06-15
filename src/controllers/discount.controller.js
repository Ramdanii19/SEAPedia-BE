import * as discountService from "../services/discount.service.js";
import { sendSuccess } from "../utils/response.js";

export async function listVouchers(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const result = await discountService.listVouchers({ page, limit });
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getVoucherByCode(req, res, next) {
  try {
    const voucher = await discountService.getVoucherByCode(req.params.code);
    return sendSuccess(res, { voucher });
  } catch (err) {
    next(err);
  }
}

export async function listPromos(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const result = await discountService.listPromos({ page, limit });
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getPromoByCode(req, res, next) {
  try {
    const promo = await discountService.getPromoByCode(req.params.code);
    return sendSuccess(res, { promo });
  } catch (err) {
    next(err);
  }
}

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
