import { Router } from "express";
import authRoutes from "./auth.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ success: true, message: "Server is healthy" });
});

router.use("/auth", authRoutes);

export default router;
