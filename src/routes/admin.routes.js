import { Router } from "express";
import { param } from "express-validator";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/enums.js";
import * as adminController from "../controllers/admin.controller.js";
import * as discountController from "../controllers/discount.controller.js";
import {
  createVoucherValidator,
  createPromoValidator,
  updateVoucherValidator,
  updatePromoValidator,
} from "../validators/discount.validator.js";
import { validate } from "../middlewares/validate.middleware.js";

const mongoId = (name = "id") => [
  param(name).isMongoId().withMessage(`Invalid ${name}`),
];

const adminGuard = [protect, requireRole(ROLES.ADMIN)];

const router = Router();

router.get("/users",         ...adminGuard, adminController.listUsers);
router.post("/users",        ...adminGuard, adminController.createUser);
router.patch("/users/:id",   ...adminGuard, ...mongoId(), validate, adminController.updateUser);
router.delete("/users/:id",  ...adminGuard, ...mongoId(), validate, adminController.deleteUser);
router.get("/stores",   ...adminGuard, adminController.listStores);
router.get("/products",      ...adminGuard, adminController.listProducts);
router.get("/orders",        ...adminGuard, adminController.listOrders);
// /orders/overdue harus di atas /orders/:id jika route detail ditambahkan nanti
router.get("/orders/overdue",       ...adminGuard, adminController.listOverdueOrders);
router.post("/simulate/next-day",    ...adminGuard, adminController.simulateNextDay);
router.post("/process-late-orders", ...adminGuard, adminController.processLateOrdersHandler);
router.get("/vouchers",      ...adminGuard, adminController.listVouchers);
router.get("/promos",        ...adminGuard, adminController.listPromos);
router.get("/delivery-jobs", ...adminGuard, adminController.listDeliveryJobs);

// Discount management (moved here from discount.routes.js for cohesion)
router.post("/vouchers",      ...adminGuard, createVoucherValidator, validate, discountController.createVoucher);
router.get("/vouchers/:id",   ...adminGuard, ...mongoId(), validate, adminController.getVoucherDetail);
router.patch("/vouchers/:id", ...adminGuard, ...mongoId(), updateVoucherValidator, validate, adminController.updateVoucher);
router.delete("/vouchers/:id",...adminGuard, ...mongoId(), validate, adminController.deleteVoucher);

router.post("/promos",        ...adminGuard, createPromoValidator, validate, discountController.createPromo);
router.get("/promos/:id",     ...adminGuard, ...mongoId(), validate, adminController.getPromoDetail);
router.patch("/promos/:id",   ...adminGuard, ...mongoId(), updatePromoValidator, validate, adminController.updatePromo);
router.delete("/promos/:id",  ...adminGuard, ...mongoId(), validate, adminController.deletePromo);

export default router;
