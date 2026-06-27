import { body } from "express-validator";

export const updateProductValidator = [
  body("name")
    .optional()
    .trim()
    .notEmpty().withMessage("Product name cannot be empty"),

  body("price")
    .optional()
    .isFloat({ min: 0 }).withMessage("Price must be a non-negative number"),

  body("stock")
    .optional()
    .isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),

  body("description")
    .optional()
    .trim(),

  body("imageUrl")
    .optional({ checkFalsy: true })
    .trim()
    .isURL({ require_tld: false }).withMessage("Image URL must be a valid URL"),
];

export const createProductValidator = [
  body("name")
    .trim()
    .notEmpty().withMessage("Product name is required"),

  body("price")
    .notEmpty().withMessage("Price is required")
    .isFloat({ min: 0 }).withMessage("Price must be a non-negative number"),

  body("stock")
    .notEmpty().withMessage("Stock is required")
    .isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),

  body("description")
    .optional()
    .trim(),

  body("imageUrl")
    .optional({ checkFalsy: true })
    .trim()
    .isURL({ require_tld: false }).withMessage("Image URL must be a valid URL"),
];
