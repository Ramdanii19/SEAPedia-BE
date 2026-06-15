import { Router } from "express";
import { checkoutValidator } from "../validators/checkout.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/enums.js";
import * as checkoutController from "../controllers/checkout.controller.js";

const router = Router();

/**
 * @openapi
 * /checkout:
 *   post:
 *     tags: [Checkout]
 *     summary: Checkout keranjang belanja menjadi order (BUYER)
 *     description: |
 *       Memproses checkout secara atomik dalam satu transaksi MongoDB:
 *       1. Validasi stok produk
 *       2. Validasi & kalkulasi diskon (voucher + promo bisa dikombinasikan)
 *       3. Potong saldo wallet buyer
 *       4. Kurangi stok produk
 *       5. Buat Order dengan status PACKING dan expiredAt sesuai SLA delivery method
 *       6. Kosongkan keranjang
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [addressId, deliveryMethod]
 *             properties:
 *               addressId:
 *                 type: string
 *                 description: ID alamat pengiriman (harus milik buyer yang login)
 *               deliveryMethod:
 *                 type: string
 *                 enum: [INSTANT, NEXT_DAY, REGULAR]
 *                 description: |
 *                   Metode pengiriman. Mempengaruhi ongkir dan SLA deadline:
 *                   - INSTANT: Rp25.000, SLA 3 jam
 *                   - NEXT_DAY: Rp15.000, SLA 24 jam
 *                   - REGULAR: Rp9.000, SLA 72 jam
 *               voucherCode:
 *                 type: string
 *                 description: Kode voucher (opsional, bisa dikombinasi dengan promoCode)
 *               promoCode:
 *                 type: string
 *                 description: Kode promo (opsional, bisa dikombinasi dengan voucherCode)
 *     responses:
 *       201:
 *         description: Order berhasil dibuat
 *       400:
 *         description: Stok tidak cukup atau saldo wallet kurang
 *       404:
 *         description: Keranjang kosong, alamat tidak ditemukan, atau kode diskon tidak valid
 *       422:
 *         $ref: '#/components/schemas/ValidationError'
 */
router.post("/", protect, requireRole(ROLES.BUYER), checkoutValidator, validate, checkoutController.checkout);

export default router;
