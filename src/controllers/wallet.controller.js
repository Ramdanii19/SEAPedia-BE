import * as walletService from "../services/wallet.service.js";
import { sendSuccess } from "../utils/response.js";

export async function getTransactions(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const result = await walletService.getTransactions({ userId: req.user._id, page, limit });
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

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
