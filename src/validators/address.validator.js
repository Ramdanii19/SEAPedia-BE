import { body } from "express-validator";

export const createAddressValidator = [
  body("recipientName")
    .trim()
    .notEmpty().withMessage("Recipient name is required"),

  body("phone")
    .trim()
    .notEmpty().withMessage("Phone number is required")
    .isMobilePhone("id-ID").withMessage("Phone number must be a valid Indonesian number"),

  body("addressDetail")
    .trim()
    .notEmpty().withMessage("Address detail is required"),

  body("isDefault")
    .optional()
    .isBoolean().withMessage("isDefault must be a boolean"),
];
