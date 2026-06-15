import * as cartService from "../services/cart.service.js";
import { sendSuccess } from "../utils/response.js";

export async function updateItemQuantity(req, res, next) {
  try {
    const cart = await cartService.updateItemQuantity({
      buyerId: req.user._id,
      productId: req.params.productId,
      quantity: req.body.quantity,
    });
    return sendSuccess(res, { cart }, "Cart updated");
  } catch (err) {
    next(err);
  }
}

export async function addToCart(req, res, next) {
  try {
    const { productId, quantity } = req.body;
    const cart = await cartService.addToCart({ buyerId: req.user._id, productId, quantity });
    return sendSuccess(res, { cart }, "Item added to cart");
  } catch (err) {
    next(err);
  }
}
