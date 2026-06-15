import { body } from "express-validator";

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
