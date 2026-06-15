import { Router } from "express";
import { param } from "express-validator";
import { createStoreValidator, updateStoreValidator } from "../validators/store.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/enums.js";
import * as storeController from "../controllers/store.controller.js";

const router = Router();

const idParam = param("id").isMongoId().withMessage("Invalid store ID");

/**
 * @openapi
 * /stores/me/store:
 *   get:
 *     tags: [Stores]
 *     summary: Ambil data toko milik seller yang login (SELLER)
 *     responses:
 *       200:
 *         description: Data toko seller
 *       403:
 *         description: Active role bukan SELLER
 *       404:
 *         description: Seller belum punya toko
 */
// /me/store harus di atas /:id agar "me" tidak ditangkap sebagai param id
router.get("/me/store", protect, requireRole(ROLES.SELLER), storeController.getMyStore);

/**
 * @openapi
 * /stores/{id}:
 *   get:
 *     tags: [Stores]
 *     summary: Detail toko berdasarkan ID (publik)
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Data toko
 *       404:
 *         description: Toko tidak ditemukan
 *   patch:
 *     tags: [Stores]
 *     summary: Update data toko seller (SELLER)
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
 *               storeName: { type: string }
 *               description: { type: string }
 *               addressDetail: { type: string }
 *     responses:
 *       200:
 *         description: Toko berhasil diupdate
 *       403:
 *         description: Toko bukan milik seller ini
 *       404:
 *         description: Toko tidak ditemukan
 *       409:
 *         description: Nama toko sudah dipakai
 */
router.get("/:id", idParam, validate, storeController.getStoreById);
router.patch("/:id", protect, requireRole(ROLES.SELLER), idParam, updateStoreValidator, validate, storeController.updateStore);

/**
 * @openapi
 * /stores:
 *   post:
 *     tags: [Stores]
 *     summary: Buat toko baru (SELLER, maks 1 toko per seller)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [storeName]
 *             properties:
 *               storeName:
 *                 type: string
 *                 example: Toko Ikan Segar
 *               description:
 *                 type: string
 *               addressDetail:
 *                 type: string
 *     responses:
 *       201:
 *         description: Toko berhasil dibuat
 *       403:
 *         description: Active role bukan SELLER
 *       409:
 *         description: Seller sudah punya toko / nama toko sudah dipakai
 *       422:
 *         $ref: '#/components/schemas/ValidationError'
 */
router.post(
  "/",
  protect,
  requireRole(ROLES.SELLER),
  createStoreValidator,
  validate,
  storeController.createStore
);

export default router;
