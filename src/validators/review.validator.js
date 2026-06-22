import { body } from "express-validator";

export const updateReviewValidator = [
  body("reviewerName")
    .optional()
    .trim()
    .notEmpty().withMessage("Reviewer name cannot be empty"),

  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),

  body("comment")
    .optional()
    .trim()
    .notEmpty().withMessage("Comment cannot be empty"),
];

export const createReviewValidator = [
  body("reviewerName")
    .trim()
    .notEmpty().withMessage("Reviewer name is required"),

  body("rating")
    .notEmpty().withMessage("Rating is required")
    .isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),

  body("comment")
    .trim()
    .notEmpty().withMessage("Comment is required"),
];
