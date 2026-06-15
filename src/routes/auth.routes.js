import { Router } from "express";
import { registerValidator, loginValidator, selectActiveRoleValidator } from "../validators/auth.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";
import * as authController from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", registerValidator, validate, authController.register);
router.post("/login", loginValidator, validate, authController.login);
router.patch("/active-role", protect, selectActiveRoleValidator, validate, authController.selectActiveRole);

export default router;
