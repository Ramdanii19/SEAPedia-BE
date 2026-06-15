import * as checkoutService from "../services/checkout.service.js";
import { sendSuccess } from "../utils/response.js";

export async function checkout(req, res, next) {
  try {
    const { addressId, deliveryMethod } = req.body;
    const order = await checkoutService.checkout({ buyerId: req.user._id, addressId, deliveryMethod });
    return sendSuccess(res, { order }, "Order placed successfully", 201);
  } catch (err) {
    next(err);
  }
}
