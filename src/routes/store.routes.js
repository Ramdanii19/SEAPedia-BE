import { Router } from "express";
import { createStoreValidator } from "../validators/store.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/enums.js";
import * as storeController from "../controllers/store.controller.js";

const router = Router();

router.post(
  "/",
  protect,
  requireRole(ROLES.SELLER),
  createStoreValidator,
  validate,
  storeController.createStore
);

export default router;
