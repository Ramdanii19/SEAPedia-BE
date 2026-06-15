import * as checkoutService from "../services/checkout.service.js";
import { sendSuccess } from "../utils/response.js";

export async function checkout(req, res, next) {
  try {
    const { addressId, deliveryMethod, voucherCode, promoCode } = req.body;
    const { order, summary } = await checkoutService.checkout({ buyerId: req.user._id, addressId, deliveryMethod, voucherCode, promoCode });
    return sendSuccess(res, { order, summary }, "Order placed successfully", 201);
  } catch (err) {
    next(err);
  }
}
