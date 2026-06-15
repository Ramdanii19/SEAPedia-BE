import * as orderService from "../services/order.service.js";
import { sendSuccess } from "../utils/response.js";

export async function getSellerOrders(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const result = await orderService.getSellerOrders({ sellerId: req.user._id, page, limit });
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function listMyOrders(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const result = await orderService.listMyOrders({ buyerId: req.user._id, page, limit });
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getOrderDetail(req, res, next) {
  try {
    const order = await orderService.getOrderDetail({ orderId: req.params.id, buyerId: req.user._id });
    return sendSuccess(res, { order });
  } catch (err) {
    next(err);
  }
}
