import * as reportService from "../services/report.service.js";
import { sendSuccess } from "../utils/response.js";

export async function getSellerRevenue(req, res, next) {
  try {
    const result = await reportService.getSellerRevenue(req.user._id);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getBuyerSpending(req, res, next) {
  try {
    const result = await reportService.getBuyerSpending(req.user._id);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}
