import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/enums.js";
import * as adminController from "../controllers/admin.controller.js";
import * as discountController from "../controllers/discount.controller.js";
import { createVoucherValidator, createPromoValidator } from "../validators/discount.validator.js";
import { validate } from "../middlewares/validate.middleware.js";

const adminGuard = [protect, requireRole(ROLES.ADMIN)];

const router = Router();

router.get("/users",    ...adminGuard, adminController.listUsers);
router.get("/stores",   ...adminGuard, adminController.listStores);
router.get("/products",      ...adminGuard, adminController.listProducts);
router.get("/orders",        ...adminGuard, adminController.listOrders);
// /orders/overdue harus di atas /orders/:id jika route detail ditambahkan nanti
router.get("/orders/overdue", ...adminGuard, adminController.listOverdueOrders);
router.get("/vouchers",      ...adminGuard, adminController.listVouchers);
router.get("/promos",        ...adminGuard, adminController.listPromos);
router.get("/delivery-jobs", ...adminGuard, adminController.listDeliveryJobs);

// Discount management (moved here from discount.routes.js for cohesion)
router.post("/vouchers", ...adminGuard, createVoucherValidator, validate, discountController.createVoucher);
router.post("/promos",   ...adminGuard, createPromoValidator,   validate, discountController.createPromo);

export default router;
