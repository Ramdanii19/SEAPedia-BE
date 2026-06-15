import { body } from "express-validator";

export const updateStoreValidator = [
  body("storeName")
    .optional()
    .trim()
    .notEmpty().withMessage("Store name cannot be empty"),

  body("description")
    .optional()
    .trim(),

  body("addressDetail")
    .optional()
    .trim(),
];

export const createStoreValidator = [
  body("storeName")
    .trim()
    .notEmpty().withMessage("Store name is required"),

  body("description")
    .optional()
    .trim(),

  body("addressDetail")
    .optional()
    .trim(),
];
