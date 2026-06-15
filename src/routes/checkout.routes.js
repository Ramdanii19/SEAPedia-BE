import { Router } from "express";
import { checkoutValidator } from "../validators/checkout.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/enums.js";
import * as checkoutController from "../controllers/checkout.controller.js";

const router = Router();

router.post("/", protect, requireRole(ROLES.BUYER), checkoutValidator, validate, checkoutController.checkout);

export default router;
