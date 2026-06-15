import { Router } from "express";
import { param } from "express-validator";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { ROLES } from "../constants/enums.js";
import * as deliveryController from "../controllers/delivery.controller.js";

const router = Router();

const idParam = param("id").isMongoId().withMessage("Invalid job ID");

/**
 * @openapi
 * /delivery/dashboard:
 *   get:
 *     tags: [Delivery]
 *     summary: Dashboard driver — job aktif, total earning, saldo wallet (DRIVER)
 *     responses:
 *       200:
 *         description: Data dashboard driver
 *       403:
 *         description: Active role bukan DRIVER
 */
router.get("/dashboard", protect, requireRole(ROLES.DRIVER), deliveryController.getDriverDashboard);

/**
 * @openapi
 * /delivery/jobs/available:
 *   get:
 *     tags: [Delivery]
 *     summary: Daftar delivery job yang tersedia untuk diambil (DRIVER)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Daftar job tersedia dengan info pengiriman dan earning
 *       403:
 *         description: Active role bukan DRIVER
 */
router.get("/jobs/available", protect, requireRole(ROLES.DRIVER), deliveryController.listAvailableJobs);

/**
 * @openapi
 * /delivery/jobs/{id}:
 *   get:
 *     tags: [Delivery]
 *     summary: Detail delivery job (DRIVER)
 *     description: |
 *       Job berstatus AVAILABLE bisa dilihat semua driver.
 *       Job TAKEN/COMPLETED hanya bisa dilihat driver yang mengambilnya.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Detail job termasuk info order dan produk
 *       403:
 *         description: Job sudah diambil driver lain
 *       404:
 *         description: Job tidak ditemukan
 */
router.get("/jobs/:id", protect, requireRole(ROLES.DRIVER), idParam, validate, deliveryController.getJobDetail);

/**
 * @openapi
 * /delivery/jobs/{id}/take:
 *   patch:
 *     tags: [Delivery]
 *     summary: Ambil delivery job (DRIVER) — concurrency-safe
 *     description: Hanya satu driver yang berhasil mengambil job yang sama. Jika sudah diambil driver lain, 409 dikembalikan.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Job berhasil diambil, order dipindah ke DELIVERING
 *       403:
 *         description: Active role bukan DRIVER
 *       409:
 *         description: Job tidak tersedia atau sudah diambil driver lain
 */
router.patch("/jobs/:id/take", protect, requireRole(ROLES.DRIVER), idParam, validate, deliveryController.takeJob);

/**
 * @openapi
 * /delivery/jobs/{id}/complete:
 *   patch:
 *     tags: [Delivery]
 *     summary: Selesaikan delivery job (DRIVER)
 *     description: Order dipindah ke COMPLETED dan earning ditransfer ke wallet driver.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Job selesai, earning masuk ke wallet driver
 *       400:
 *         description: Status job bukan TAKEN
 *       403:
 *         description: Job bukan milik driver ini
 *       404:
 *         description: Job tidak ditemukan
 */
router.patch("/jobs/:id/complete", protect, requireRole(ROLES.DRIVER), idParam, validate, deliveryController.completeJob);

export default router;
