import { Router } from "express";
import { param } from "express-validator";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { ROLES } from "../constants/enums.js";
import * as orderController from "../controllers/order.controller.js";

const router = Router();

const idParam = param("id").isMongoId().withMessage("Invalid order ID");

/**
 * @openapi
 * /orders:
 *   get:
 *     tags: [Orders]
 *     summary: Daftar order milik buyer yang login (BUYER)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Daftar order dengan pagination
 *       403:
 *         description: Active role bukan BUYER
 */
router.get("/", protect, requireRole(ROLES.BUYER), orderController.listMyOrders);

/**
 * @openapi
 * /orders/seller/incoming:
 *   get:
 *     tags: [Orders]
 *     summary: Daftar order masuk ke toko seller (SELLER)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Daftar order masuk
 *       403:
 *         description: Active role bukan SELLER
 *       404:
 *         description: Seller belum punya toko
 */
// /seller/incoming harus di atas /:id agar "seller" tidak ditangkap sebagai param id
router.get("/seller/incoming", protect, requireRole(ROLES.SELLER), orderController.getSellerOrders);

/**
 * @openapi
 * /orders/{id}/process:
 *   patch:
 *     tags: [Orders]
 *     summary: Proses order (PACKING → WAITING_DELIVERY) dan buat delivery job (SELLER)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order dipindah ke WAITING_DELIVERY, delivery job dibuat
 *       400:
 *         description: Status order bukan PACKING
 *       403:
 *         description: Order bukan milik toko seller ini
 *       404:
 *         description: Order tidak ditemukan
 */
router.patch("/:id/process", protect, requireRole(ROLES.SELLER), idParam, validate, orderController.processOrder);

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Detail order beserta timeline status (BUYER)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Data order lengkap termasuk items dan store info
 *       403:
 *         description: Order bukan milik buyer ini
 *       404:
 *         description: Order tidak ditemukan
 */
router.get("/:id", protect, requireRole(ROLES.BUYER), idParam, validate, orderController.getOrderDetail);

export default router;
