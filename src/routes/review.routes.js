import { Router } from "express";
import { param } from "express-validator";
import { createReviewValidator, updateReviewValidator } from "../validators/review.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { protect, optionalProtect } from "../middlewares/auth.middleware.js";
import * as reviewController from "../controllers/review.controller.js";

const router = Router();

const idParam = param("id").isMongoId().withMessage("Invalid review ID");

router.get("/", reviewController.listReviews);
router.post("/", optionalProtect, createReviewValidator, validate, reviewController.createReview);
router.patch("/:id", protect, idParam, updateReviewValidator, validate, reviewController.updateReview);
router.delete("/:id", protect, idParam, validate, reviewController.deleteReview);

export default router;
