import { Router } from "express";
import { param } from "express-validator";
import { addToCartValidator, updateItemQuantityValidator } from "../validators/cart.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/enums.js";
import * as cartController from "../controllers/cart.controller.js";

const router = Router();

const productIdParam = param("productId").isMongoId().withMessage("Invalid product ID");

router.get("/", protect, requireRole(ROLES.BUYER), cartController.getCart);
router.post("/items", protect, requireRole(ROLES.BUYER), addToCartValidator, validate, cartController.addToCart);
router.patch("/items/:productId", protect, requireRole(ROLES.BUYER), productIdParam, updateItemQuantityValidator, validate, cartController.updateItemQuantity);
router.delete("/items/:productId", protect, requireRole(ROLES.BUYER), productIdParam, validate, cartController.removeItem);

export default router;
