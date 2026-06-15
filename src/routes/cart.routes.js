import { Router } from "express";
import { addToCartValidator } from "../validators/cart.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/enums.js";
import * as cartController from "../controllers/cart.controller.js";

const router = Router();

router.post("/items", protect, requireRole(ROLES.BUYER), addToCartValidator, validate, cartController.addToCart);

export default router;
