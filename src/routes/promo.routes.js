import { Router } from "express";
import * as discountController from "../controllers/discount.controller.js";

const router = Router();

router.get("/", discountController.listPromos);
router.get("/:code", discountController.getPromoByCode);

export default router;
