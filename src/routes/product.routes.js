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

/**
 * @openapi
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: Daftar produk publik (semua toko)
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10, maximum: 100 }
 *     responses:
 *       200:
 *         description: Daftar produk dengan pagination
 */
router.get("/", productController.listPublicProducts);

/**
 * @openapi
 * /products/me/list:
 *   get:
 *     tags: [Products]
 *     summary: Daftar produk milik toko seller yang login (SELLER)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Daftar produk milik seller
 *       403:
 *         description: Active role bukan SELLER
 *       404:
 *         description: Seller belum punya toko
 */
// /me/list harus di atas /:id agar "me" tidak ditangkap sebagai param id
router.get("/me/list", protect, requireRole(ROLES.SELLER), productController.listMyProducts);

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Detail produk berdasarkan ID
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Data produk
 *       404:
 *         description: Produk tidak ditemukan
 *       422:
 *         description: ID tidak valid
 */
router.get("/:id", idParam, validate, productController.getProductDetail);

/**
 * @openapi
 * /products:
 *   post:
 *     tags: [Products]
 *     summary: Buat produk baru di toko seller (SELLER)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, stock]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ikan Salmon Segar
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 example: 85000
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *                 example: 50
 *               description:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: Produk berhasil dibuat
 *       403:
 *         description: Active role bukan SELLER
 *       404:
 *         description: Seller belum punya toko
 *       422:
 *         $ref: '#/components/schemas/ValidationError'
 */
router.post(
  "/",
  protect,
  requireRole(ROLES.SELLER),
  createProductValidator,
  validate,
  productController.createProduct
);

/**
 * @openapi
 * /products/{id}:
 *   patch:
 *     tags: [Products]
 *     summary: Update produk milik toko seller (SELLER)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               price: { type: number, minimum: 0 }
 *               stock: { type: integer, minimum: 0 }
 *               description: { type: string }
 *               imageUrl: { type: string, format: uri }
 *     responses:
 *       200:
 *         description: Produk berhasil diupdate
 *       403:
 *         description: Produk bukan milik toko seller ini
 *       404:
 *         description: Produk tidak ditemukan
 *   delete:
 *     tags: [Products]
 *     summary: Hapus produk milik toko seller (SELLER)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Produk berhasil dihapus
 *       403:
 *         description: Produk bukan milik toko seller ini
 *       404:
 *         description: Produk tidak ditemukan
 */
router.patch("/:id", protect, requireRole(ROLES.SELLER), idParam, updateProductValidator, validate, productController.updateProduct);
router.delete("/:id", protect, requireRole(ROLES.SELLER), idParam, validate, productController.deleteProduct);

export default router;
