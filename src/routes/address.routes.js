import { Router } from "express";
import { createAddressValidator, updateAddressValidator } from "../validators/address.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/enums.js";
import * as addressController from "../controllers/address.controller.js";

const router = Router();

router.get("/", protect, requireRole(ROLES.BUYER), addressController.listAddresses);
router.patch("/:id", protect, requireRole(ROLES.BUYER), updateAddressValidator, validate, addressController.updateAddress);
router.delete("/:id", protect, requireRole(ROLES.BUYER), addressController.deleteAddress);

router.post(
  "/",
  protect,
  requireRole(ROLES.BUYER),
  createAddressValidator,
  validate,
  addressController.createAddress
);

export default router;
