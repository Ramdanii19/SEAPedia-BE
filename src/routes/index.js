import { Router } from "express";
import authRoutes from "./auth.routes.js";
import reviewRoutes from "./review.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ success: true, message: "Server is healthy" });
});

router.use("/auth", authRoutes);
router.use("/reviews", reviewRoutes);

export default router;
