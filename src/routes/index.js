import { Router } from "express";
import authRoutes from "./auth.routes.js";
import reviewRoutes from "./review.routes.js";
import storeRoutes from "./store.routes.js";
import productRoutes from "./product.routes.js";
import walletRoutes from "./wallet.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ success: true, message: "Server is healthy" });
});

router.use("/auth", authRoutes);
router.use("/reviews", reviewRoutes);
router.use("/stores", storeRoutes);
router.use("/products", productRoutes);
router.use("/wallet", walletRoutes);

export default router;
