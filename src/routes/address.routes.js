import { Router } from "express";
import { createAddressValidator } from "../validators/address.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/enums.js";
import * as addressController from "../controllers/address.controller.js";

const router = Router();

router.post(
  "/",
  protect,
  requireRole(ROLES.BUYER),
  createAddressValidator,
  validate,
  addressController.createAddress
);

export default router;
