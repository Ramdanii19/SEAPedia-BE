import { Router } from "express";
import { createStoreValidator, updateStoreValidator } from "../validators/store.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/enums.js";
import * as storeController from "../controllers/store.controller.js";

const router = Router();

// /me/store harus di atas /:id agar "me" tidak ditangkap sebagai param id
router.get("/me/store", protect, requireRole(ROLES.SELLER), storeController.getMyStore);
router.get("/:id", storeController.getStoreById);
router.patch("/:id", protect, requireRole(ROLES.SELLER), updateStoreValidator, validate, storeController.updateStore);

router.post(
  "/",
  protect,
  requireRole(ROLES.SELLER),
  createStoreValidator,
  validate,
  storeController.createStore
);

export default router;
