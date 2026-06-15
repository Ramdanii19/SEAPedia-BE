import * as walletService from "../services/wallet.service.js";
import { sendSuccess } from "../utils/response.js";

export async function topUp(req, res, next) {
  try {
    const wallet = await walletService.topUp({ userId: req.user._id, amount: req.body.amount });
    return sendSuccess(res, { wallet }, "Top up successful");
  } catch (err) {
    next(err);
  }
}

export async function getWallet(req, res, next) {
  try {
    const wallet = await walletService.getWallet(req.user._id);
    return sendSuccess(res, { wallet });
  } catch (err) {
    next(err);
  }
}
