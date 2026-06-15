import * as adminService from "../services/admin.service.js";
import { sendSuccess } from "../utils/response.js";

export async function listUsers(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const result = await adminService.listUsers({ page, limit });
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function listStores(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const result = await adminService.listStores({ page, limit });
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}
