import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/enums.js";
import * as orderController from "../controllers/order.controller.js";

const router = Router();

router.get("/", protect, requireRole(ROLES.BUYER), orderController.listMyOrders);
// /seller/incoming harus di atas /:id agar "seller" tidak ditangkap sebagai param id
router.get("/seller/incoming", protect, requireRole(ROLES.SELLER), orderController.getSellerOrders);
router.patch("/:id/process", protect, requireRole(ROLES.SELLER), orderController.processOrder);
router.get("/:id", protect, requireRole(ROLES.BUYER), orderController.getOrderDetail);

export default router;
