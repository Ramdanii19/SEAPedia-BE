import * as walletService from "../services/wallet.service.js";
import { sendSuccess } from "../utils/response.js";

export async function getWallet(req, res, next) {
  try {
    const wallet = await walletService.getWallet(req.user._id);
    return sendSuccess(res, { wallet });
  } catch (err) {
    next(err);
  }
}
