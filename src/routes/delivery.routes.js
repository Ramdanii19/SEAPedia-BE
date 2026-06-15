import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/enums.js";
import * as deliveryController from "../controllers/delivery.controller.js";

const router = Router();

router.get("/jobs/available", protect, requireRole(ROLES.DRIVER), deliveryController.listAvailableJobs);

export default router;
