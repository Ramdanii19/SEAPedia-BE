import * as adminService from "../services/admin.service.js";
import { sendSuccess } from "../utils/response.js";

export async function listVouchers(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    return sendSuccess(res, await adminService.listVouchers({ page, limit }));
  } catch (err) { next(err); }
}

export async function listPromos(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    return sendSuccess(res, await adminService.listPromos({ page, limit }));
  } catch (err) { next(err); }
}

export async function listDeliveryJobs(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    return sendSuccess(res, await adminService.listDeliveryJobs({ page, limit }));
  } catch (err) { next(err); }
}

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

export async function listProducts(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const result = await adminService.listProducts({ page, limit });
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function listOrders(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const result = await adminService.listOrders({ page, limit });
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
