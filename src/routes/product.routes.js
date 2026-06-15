import { Router } from "express";
import { param } from "express-validator";
import { createProductValidator, updateProductValidator } from "../validators/product.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/enums.js";
import * as productController from "../controllers/product.controller.js";

const router = Router();

const idParam = param("id").isMongoId().withMessage("Invalid product ID");

router.get("/", productController.listPublicProducts);
// /me/list harus di atas /:id agar "me" tidak ditangkap sebagai param id
router.get("/me/list", protect, requireRole(ROLES.SELLER), productController.listMyProducts);
router.get("/:id", idParam, validate, productController.getProductDetail);
router.patch("/:id", protect, requireRole(ROLES.SELLER), idParam, updateProductValidator, validate, productController.updateProduct);
router.delete("/:id", protect, requireRole(ROLES.SELLER), idParam, validate, productController.deleteProduct);

router.post(
  "/",
  protect,
  requireRole(ROLES.SELLER),
  createProductValidator,
  validate,
  productController.createProduct
);

export default router;
