import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/enums.js";
import * as reportController from "../controllers/report.controller.js";

const router = Router();

router.get("/buyer/spending", protect, requireRole(ROLES.BUYER), reportController.getBuyerSpending);
router.get("/seller/revenue", protect, requireRole(ROLES.SELLER), reportController.getSellerRevenue);
router.get("/admin",          protect, requireRole(ROLES.ADMIN), reportController.getAdminReport);

export default router;
