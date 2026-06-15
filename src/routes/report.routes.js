import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/enums.js";
import * as reportController from "../controllers/report.controller.js";

const router = Router();

router.get("/buyer/spending", protect, requireRole(ROLES.BUYER), reportController.getBuyerSpending);

export default router;
