import * as wishlistService from "../services/wishlist.service.js";
import { sendSuccess } from "../utils/response.js";

export async function getWishlist(req, res, next) {
  try {
    const result = await wishlistService.getWishlist(req.user._id);
    return sendSuccess(res, result);
  } catch (err) { next(err); }
}

export async function toggleWishlist(req, res, next) {
  try {
    const result = await wishlistService.toggleWishlist(req.user._id, req.params.productId);
    return sendSuccess(res, result, result.added ? "Ditambahkan ke wishlist" : "Dihapus dari wishlist");
  } catch (err) { next(err); }
}
