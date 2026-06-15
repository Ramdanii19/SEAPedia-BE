import { body } from "express-validator";
import { ROLES } from "../constants/enums.js";

const ALLOWED_ROLES = [ROLES.SELLER, ROLES.BUYER, ROLES.DRIVER];

export const registerValidator = [
  body("fullName")
    .trim()
    .notEmpty().withMessage("Full name is required"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Email must be valid")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),

  body("roles")
    .notEmpty().withMessage("Roles is required")
    .isArray({ min: 1 }).withMessage("Roles must be a non-empty array")
    .custom((roles) => {
      const invalid = roles.filter((r) => !ALLOWED_ROLES.includes(r));
      if (invalid.length > 0) {
        throw new Error(`Invalid roles: ${invalid.join(", ")}. Admin role cannot be self-assigned`);
      }
      return true;
    }),
];
