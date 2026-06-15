import { Router } from "express";
import { createProductValidator, updateProductValidator } from "../validators/product.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/enums.js";
import * as productController from "../controllers/product.controller.js";

const router = Router();

router.get("/", productController.listPublicProducts);
// /me/list harus di atas /:id agar "me" tidak ditangkap sebagai param id
router.get("/me/list", protect, requireRole(ROLES.SELLER), productController.listMyProducts);
router.get("/:id", productController.getProductDetail);
router.patch("/:id", protect, requireRole(ROLES.SELLER), updateProductValidator, validate, productController.updateProduct);
router.delete("/:id", protect, requireRole(ROLES.SELLER), productController.deleteProduct);

router.post(
  "/",
  protect,
  requireRole(ROLES.SELLER),
  createProductValidator,
  validate,
  productController.createProduct
);

export default router;
