import { body } from "express-validator";
import { DELIVERY_METHOD } from "../constants/enums.js";

export const checkoutValidator = [
  body("addressId")
    .notEmpty().withMessage("Address is required")
    .isMongoId().withMessage("Invalid address ID"),

  body("deliveryMethod")
    .notEmpty().withMessage("Delivery method is required")
    .isIn(Object.values(DELIVERY_METHOD)).withMessage("Invalid delivery method"),
];
