import { body } from "express-validator";

export const updateAddressValidator = [
  body("label")
    .optional()
    .trim(),

  body("recipientName")
    .optional()
    .trim()
    .notEmpty().withMessage("Recipient name cannot be empty"),

  body("phone")
    .optional()
    .trim()
    .matches(/^(\+62|62|0)[0-9]{8,13}$/).withMessage("Nomor HP tidak valid (contoh: 081234567890)"),

  body("addressDetail")
    .optional()
    .trim()
    .notEmpty().withMessage("Address detail cannot be empty"),

  body("isDefault")
    .optional()
    .isBoolean().withMessage("isDefault must be a boolean"),
];

export const createAddressValidator = [
  body("label")
    .optional()
    .trim(),

  body("recipientName")
    .trim()
    .notEmpty().withMessage("Recipient name is required"),

  body("phone")
    .trim()
    .notEmpty().withMessage("Phone number is required")
    .matches(/^(\+62|62|0)[0-9]{8,13}$/).withMessage("Nomor HP tidak valid (contoh: 081234567890)"),

  body("addressDetail")
    .trim()
    .notEmpty().withMessage("Address detail is required"),

  body("isDefault")
    .optional()
    .isBoolean().withMessage("isDefault must be a boolean"),
];
