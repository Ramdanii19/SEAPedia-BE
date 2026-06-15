import * as deliveryService from "../services/delivery.service.js";
import { sendSuccess } from "../utils/response.js";

export async function getDriverDashboard(req, res, next) {
  try {
    const result = await deliveryService.getDriverDashboard(req.user._id);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function completeJob(req, res, next) {
  try {
    const job = await deliveryService.completeJob({ jobId: req.params.id, driverId: req.user._id });
    return sendSuccess(res, { job }, "Delivery completed");
  } catch (err) {
    next(err);
  }
}

export async function takeJob(req, res, next) {
  try {
    const job = await deliveryService.takeJob({ jobId: req.params.id, driverId: req.user._id });
    return sendSuccess(res, { job }, "Job taken successfully");
  } catch (err) {
    next(err);
  }
}

export async function getJobDetail(req, res, next) {
  try {
    const job = await deliveryService.getJobDetail({ jobId: req.params.id, driverId: req.user._id });
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
