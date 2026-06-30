import { Router } from "express";
import { registerValidator, loginValidator, selectActiveRoleValidator } from "../validators/auth.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";
import * as authController from "../controllers/auth.controller.js";

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register akun baru
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, password, roles]
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Budi Santoso
 *               email:
 *                 type: string
 *                 format: email
 *                 example: budi@mail.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: secret123
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [BUYER, SELLER, DRIVER]
 *                 example: [BUYER]
 *     responses:
 *       201:
 *         description: Akun berhasil dibuat, token JWT dikembalikan
 *       409:
 *         description: Email sudah terdaftar
 *       422:
 *         $ref: '#/components/schemas/ValidationError'
 */
router.post("/register", registerValidator, validate, authController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login dan dapatkan token JWT
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: |
 *           Login berhasil. Jika `needRoleSelection: true`, panggil `PATCH /auth/active-role` terlebih dahulu.
 *       401:
 *         description: Email atau password salah
 *       422:
 *         $ref: '#/components/schemas/ValidationError'
 */
router.post("/login", loginValidator, validate, authController.login);

/**
 * @openapi
 * /auth/active-role:
 *   patch:
 *     tags: [Auth]
 *     summary: Pilih active role (untuk user multi-role)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [BUYER, SELLER, DRIVER]
 *     responses:
 *       200:
 *         description: Active role diupdate, token baru dikembalikan
 *       400:
 *         description: Role tidak ada di daftar role user
 *       422:
 *         $ref: '#/components/schemas/ValidationError'
 */
router.patch("/active-role", protect, selectActiveRoleValidator, validate, authController.selectActiveRole);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Ambil profil user yang sedang login
 *     responses:
 *       200:
 *         description: Data profil user
 *       401:
 *         description: Unauthenticated
 */
router.get("/me", protect, authController.getMe);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout dan invalidasi token
 *     responses:
 *       200:
 *         description: Token di-blacklist, logout berhasil
 *       401:
 *         description: Unauthenticated
 */
router.post("/logout", protect, authController.logout);

router.get("/google", authController.googleAuth);
router.get("/google/callback", authController.googleCallback);

export default router;
