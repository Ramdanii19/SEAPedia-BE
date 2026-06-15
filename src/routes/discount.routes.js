import { Router } from "express";
import { createVoucherValidator, createPromoValidator } from "../validators/discount.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/enums.js";
import * as discountController from "../controllers/discount.controller.js";

const router = Router();

router.post("/vouchers", protect, requireRole(ROLES.ADMIN), createVoucherValidator, validate, discountController.createVoucher);
router.post("/promos", protect, requireRole(ROLES.ADMIN), createPromoValidator, validate, discountController.createPromo);

export default router;
