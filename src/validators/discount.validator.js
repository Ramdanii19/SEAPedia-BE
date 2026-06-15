import { body } from "express-validator";
import { DISCOUNT_TYPE } from "../constants/enums.js";

export const createVoucherValidator = [
  body("name")
    .trim()
    .notEmpty().withMessage("Voucher name is required"),

  body("code")
    .trim()
    .notEmpty().withMessage("Voucher code is required"),

  body("discountType")
    .notEmpty().withMessage("Discount type is required")
    .isIn(Object.values(DISCOUNT_TYPE)).withMessage("Invalid discount type"),

  body("discountValue")
    .notEmpty().withMessage("Discount value is required")
    .isFloat({ min: 0 }).withMessage("Discount value must be non-negative")
    .custom((value, { req }) => {
      if (req.body.discountType === DISCOUNT_TYPE.PERCENTAGE && value > 100) {
        throw new Error("Percentage discount cannot exceed 100");
      }
      return true;
    }),

  body("remainingUsage")
    .notEmpty().withMessage("Remaining usage is required")
    .isInt({ min: 1 }).withMessage("Remaining usage must be at least 1"),

  body("expiryDate")
    .notEmpty().withMessage("Expiry date is required")
    .isISO8601().withMessage("Expiry date must be a valid date")
    .custom((value) => {
      if (new Date(value) <= new Date()) throw new Error("Expiry date must be in the future");
      return true;
    }),
];

export const createPromoValidator = [
  body("name")
    .trim()
    .notEmpty().withMessage("Promo name is required"),

  body("code")
    .trim()
    .notEmpty().withMessage("Promo code is required"),

  body("discountType")
    .notEmpty().withMessage("Discount type is required")
    .isIn(Object.values(DISCOUNT_TYPE)).withMessage("Invalid discount type"),

  body("discountValue")
    .notEmpty().withMessage("Discount value is required")
    .isFloat({ min: 0 }).withMessage("Discount value must be non-negative")
    .custom((value, { req }) => {
      if (req.body.discountType === DISCOUNT_TYPE.PERCENTAGE && value > 100) {
        throw new Error("Percentage discount cannot exceed 100");
      }
      return true;
    }),

  body("expiryDate")
    .notEmpty().withMessage("Expiry date is required")
    .isISO8601().withMessage("Expiry date must be a valid date")
    .custom((value) => {
      if (new Date(value) <= new Date()) throw new Error("Expiry date must be in the future");
      return true;
    }),
];
