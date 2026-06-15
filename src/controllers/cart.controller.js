import * as cartService from "../services/cart.service.js";
import { sendSuccess } from "../utils/response.js";

export async function addToCart(req, res, next) {
  try {
    const { productId, quantity } = req.body;
    const cart = await cartService.addToCart({ buyerId: req.user._id, productId, quantity });
    return sendSuccess(res, { cart }, "Item added to cart");
  } catch (err) {
    next(err);
  }
}
