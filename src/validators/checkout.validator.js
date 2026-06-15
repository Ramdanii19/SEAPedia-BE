import { body } from "express-validator";
import { DELIVERY_METHOD } from "../constants/enums.js";

export const checkoutValidator = [
  body("addressId")
    .notEmpty().withMessage("Address is required")
    .isMongoId().withMessage("Invalid address ID"),

  body("deliveryMethod")
    .notEmpty().withMessage("Delivery method is required")
    .isIn(Object.values(DELIVERY_METHOD)).withMessage("Invalid delivery method"),

  body("voucherCode")
    .optional()
    .trim()
    .notEmpty().withMessage("Voucher code cannot be empty if provided"),

  body("promoCode")
    .optional()
    .trim()
    .notEmpty().withMessage("Promo code cannot be empty if provided"),
];
