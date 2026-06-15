import { Router } from "express";
import * as discountController from "../controllers/discount.controller.js";

const router = Router();

router.get("/", discountController.listVouchers);
router.get("/:code", discountController.getVoucherByCode);

export default router;
