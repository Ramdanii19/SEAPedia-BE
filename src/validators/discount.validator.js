import { body } from "express-validator";
import { DISCOUNT_TYPE } from "../constants/enums.js";

const discountValueRules = (required = true) => {
  const chain = required
    ? body("discountValue").notEmpty().withMessage("Discount value is required")
    : body("discountValue").optional();
  return chain
    .isFloat({ min: 0 }).withMessage("Discount value must be non-negative")
    .custom((value, { req }) => {
      const type = req.body.discountType;
      if (type === DISCOUNT_TYPE.PERCENTAGE && value > 100) {
        throw new Error("Percentage discount cannot exceed 100");
      }
      return true;
    });
};

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

export const updateVoucherValidator = [
  body("name").optional().trim().notEmpty().withMessage("Voucher name cannot be empty"),
  body("code").optional().trim().notEmpty().withMessage("Voucher code cannot be empty"),
  body("discountType").optional().isIn(Object.values(DISCOUNT_TYPE)).withMessage("Invalid discount type"),
  discountValueRules(false),
  body("remainingUsage").optional().isInt({ min: 0 }).withMessage("Remaining usage must be a non-negative integer"),
  body("expiryDate")
    .optional()
    .isISO8601().withMessage("Expiry date must be a valid date")
    .custom((value) => {
      if (new Date(value) <= new Date()) throw new Error("Expiry date must be in the future");
      return true;
    }),
];

export const updatePromoValidator = [
  body("name").optional().trim().notEmpty().withMessage("Promo name cannot be empty"),
  body("code").optional().trim().notEmpty().withMessage("Promo code cannot be empty"),
  body("discountType").optional().isIn(Object.values(DISCOUNT_TYPE)).withMessage("Invalid discount type"),
  discountValueRules(false),
  body("expiryDate")
    .optional()
    .isISO8601().withMessage("Expiry date must be a valid date")
    .custom((value) => {
      if (new Date(value) <= new Date()) throw new Error("Expiry date must be in the future");
      return true;
    }),
];
