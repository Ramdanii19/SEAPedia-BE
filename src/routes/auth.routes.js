import { Router } from "express";
import { registerValidator } from "../validators/auth.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import * as authController from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", registerValidator, validate, authController.register);

export default router;
