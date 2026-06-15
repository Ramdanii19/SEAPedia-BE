import { Router } from "express";
import authRoutes from "./auth.routes.js";
import reviewRoutes from "./review.routes.js";
import storeRoutes from "./store.routes.js";
import productRoutes from "./product.routes.js";
import walletRoutes from "./wallet.routes.js";
import addressRoutes from "./address.routes.js";
import cartRoutes from "./cart.routes.js";
import checkoutRoutes from "./checkout.routes.js";
import orderRoutes from "./order.routes.js";
import discountRoutes from "./discount.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ success: true, message: "Server is healthy" });
});

router.use("/auth", authRoutes);
router.use("/reviews", reviewRoutes);
router.use("/stores", storeRoutes);
router.use("/products", productRoutes);
router.use("/wallet", walletRoutes);
router.use("/addresses", addressRoutes);
router.use("/cart", cartRoutes);
router.use("/checkout", checkoutRoutes);
router.use("/orders", orderRoutes);
router.use("/admin", discountRoutes);

export default router;
