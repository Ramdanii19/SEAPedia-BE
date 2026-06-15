import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/enums.js";
import * as deliveryController from "../controllers/delivery.controller.js";

const router = Router();

router.get("/dashboard", protect, requireRole(ROLES.DRIVER), deliveryController.getDriverDashboard);
router.get("/jobs/available", protect, requireRole(ROLES.DRIVER), deliveryController.listAvailableJobs);
router.get("/jobs/:id", protect, requireRole(ROLES.DRIVER), deliveryController.getJobDetail);
router.patch("/jobs/:id/take", protect, requireRole(ROLES.DRIVER), deliveryController.takeJob);
router.patch("/jobs/:id/complete", protect, requireRole(ROLES.DRIVER), deliveryController.completeJob);

export default router;
