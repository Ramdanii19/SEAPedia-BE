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
import adminRoutes from "./admin.routes.js";
import reportRoutes from "./report.routes.js";
import deliveryRoutes from "./delivery.routes.js";
import voucherRoutes from "./voucher.routes.js";
import promoRoutes from "./promo.routes.js";
import uploadRoutes from "./upload.routes.js";

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
router.use("/admin", adminRoutes);
router.use("/reports", reportRoutes);
router.use("/delivery", deliveryRoutes);
router.use("/vouchers", voucherRoutes);
router.use("/promos", promoRoutes);
router.use("/upload", uploadRoutes);

export default router;
