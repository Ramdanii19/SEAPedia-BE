import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/enums.js";
import * as walletController from "../controllers/wallet.controller.js";

const router = Router();

router.get("/", protect, requireRole(ROLES.BUYER), walletController.getWallet);

export default router;
