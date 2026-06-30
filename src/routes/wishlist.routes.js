import { Router } from "express";
import { param } from "express-validator";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { ROLES } from "../constants/enums.js";
import * as wishlistController from "../controllers/wishlist.controller.js";

const router = Router();
const buyerGuard = [protect, requireRole(ROLES.BUYER)];

router.get("/",               ...buyerGuard, wishlistController.getWishlist);
router.post("/:productId",    ...buyerGuard, param("productId").isMongoId(), validate, wishlistController.toggleWishlist);

export default router;
