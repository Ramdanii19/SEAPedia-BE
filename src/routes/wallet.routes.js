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

router.get("/", protect, requireRole(ROLES.BUYER), walletController.getWallet);
router.get("/transactions", protect, requireRole(ROLES.BUYER), walletController.getTransactions);
router.post("/topup", protect, requireRole(ROLES.BUYER), topUpValidator, validate, walletController.topUp);

export default router;
