import { Router } from "express";
import { body } from "express-validator";
import { validate } from "../middlewares/validate.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/enums.js";
import * as walletController from "../controllers/wallet.controller.js";

const router = Router();

const topUpValidator = [
  body("amount")
    .notEmpty().withMessage("Amount is required")
    .isFloat({ gt: 0 }).withMessage("Amount must be greater than 0"),
];

/**
 * @openapi
 * /wallet:
 *   get:
 *     tags: [Wallet]
 *     summary: Cek saldo wallet buyer (BUYER)
 *     responses:
 *       200:
 *         description: Data wallet termasuk saldo
 *       403:
 *         description: Active role bukan BUYER
 */
router.get("/", protect, requireRole(ROLES.BUYER), walletController.getWallet);

/**
 * @openapi
 * /wallet/transactions:
 *   get:
 *     tags: [Wallet]
 *     summary: Riwayat transaksi wallet buyer (BUYER)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Daftar transaksi (TOPUP, PAYMENT, REFUND) dengan pagination
 *       403:
 *         description: Active role bukan BUYER
 */
router.get("/transactions", protect, requireRole(ROLES.BUYER), walletController.getTransactions);

/**
 * @openapi
 * /wallet/topup:
 *   post:
 *     tags: [Wallet]
 *     summary: Top up saldo wallet (BUYER)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount:
 *                 type: number
 *                 exclusiveMinimum: 0
 *                 example: 100000
 *     responses:
 *       200:
 *         description: Saldo berhasil ditambahkan, wallet terbaru dikembalikan
 *       403:
 *         description: Active role bukan BUYER
 *       422:
 *         $ref: '#/components/schemas/ValidationError'
 */
router.post("/topup", protect, requireRole(ROLES.BUYER), topUpValidator, validate, walletController.topUp);

export default router;
