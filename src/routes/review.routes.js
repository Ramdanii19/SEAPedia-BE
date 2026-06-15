import { Router } from "express";
import { createReviewValidator } from "../validators/review.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import * as reviewController from "../controllers/review.controller.js";

const router = Router();

router.post("/", createReviewValidator, validate, reviewController.createReview);

export default router;
