import { Router } from "express";
import { param } from "express-validator";
import { createAddressValidator, updateAddressValidator } from "../validators/address.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/enums.js";
import * as addressController from "../controllers/address.controller.js";

const router = Router();

const idParam = param("id").isMongoId().withMessage("Invalid address ID");

router.get("/", protect, requireRole(ROLES.BUYER), addressController.listAddresses);
router.patch("/:id", protect, requireRole(ROLES.BUYER), idParam, updateAddressValidator, validate, addressController.updateAddress);
router.delete("/:id", protect, requireRole(ROLES.BUYER), idParam, validate, addressController.deleteAddress);

router.post(
  "/",
  protect,
  requireRole(ROLES.BUYER),
  createAddressValidator,
  validate,
  addressController.createAddress
);

export default router;
