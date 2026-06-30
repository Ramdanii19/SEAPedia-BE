import * as adminService from "../services/admin.service.js";
import { processLateOrders } from "../services/lateHandling.service.js";
import { sendSuccess } from "../utils/response.js";

export async function processLateOrdersHandler(req, res, next) {
  try {
    const results = await processLateOrders();
    return sendSuccess(res, results, `Processed ${results.processed} late order(s)`);
  } catch (err) { next(err); }
}

export async function simulateNextDay(req, res, next) {
  try {
    const result = await adminService.simulateNextDay();
    return sendSuccess(res, result, "System time advanced by 1 day");
  } catch (err) { next(err); }
}

export async function listOverdueOrders(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    return sendSuccess(res, await adminService.listOverdueOrders({ page, limit }));
  } catch (err) { next(err); }
}

export async function getVoucherDetail(req, res, next) {
  try { return sendSuccess(res, { voucher: await adminService.getVoucherDetail(req.params.id) }); }
  catch (err) { next(err); }
}

export async function updateVoucher(req, res, next) {
  try { return sendSuccess(res, { voucher: await adminService.updateVoucher(req.params.id, req.body) }, "Voucher updated"); }
  catch (err) { next(err); }
}

export async function deleteVoucher(req, res, next) {
  try { await adminService.deleteVoucher(req.params.id); return sendSuccess(res, null, "Voucher deleted"); }
  catch (err) { next(err); }
}

export async function getPromoDetail(req, res, next) {
  try { return sendSuccess(res, { promo: await adminService.getPromoDetail(req.params.id) }); }
  catch (err) { next(err); }
}

export async function updatePromo(req, res, next) {
  try { return sendSuccess(res, { promo: await adminService.updatePromo(req.params.id, req.body) }, "Promo updated"); }
  catch (err) { next(err); }
}

export async function deletePromo(req, res, next) {
  try { await adminService.deletePromo(req.params.id); return sendSuccess(res, null, "Promo deleted"); }
  catch (err) { next(err); }
}

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

export async function createUser(req, res, next) {
  try {
    const { fullName, email, password, roles, activeRole } = req.body;
    const user = await adminService.createUser({ fullName, email, password, roles, activeRole });
    return sendSuccess(res, { user }, "User berhasil dibuat", 201);
  } catch (err) { next(err); }
}

export async function updateUser(req, res, next) {
  try {
    const user = await adminService.updateUser(req.params.id, req.body);
    return sendSuccess(res, { user }, "User berhasil diperbarui");
  } catch (err) { next(err); }
}

export async function deleteUser(req, res, next) {
  try {
    await adminService.deleteUser(req.params.id);
    return sendSuccess(res, null, "User berhasil dihapus");
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
