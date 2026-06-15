import * as deliveryService from "../services/delivery.service.js";
import { sendSuccess } from "../utils/response.js";

export async function getJobDetail(req, res, next) {
  try {
    const job = await deliveryService.getJobDetail(req.params.id);
    return sendSuccess(res, { job });
  } catch (err) {
    next(err);
  }
}

export async function listAvailableJobs(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const result = await deliveryService.listAvailableJobs({ page, limit });
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}
