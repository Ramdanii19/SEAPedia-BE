import mongoose from "mongoose";
import { ORDER_STATUS, DELIVERY_METHOD } from "../constants/enums.js";

const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },

    // Address snapshot — disalin saat checkout agar perubahan alamat tidak mempengaruhi order lama
    shippingRecipientName: { type: String, required: true },
    shippingPhone:         { type: String, required: true },
    shippingAddress:       { type: String, required: true },

    voucher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voucher",
      default: null,
    },
    promo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Promo",
      default: null,
    },

    items: [
      {
        product:     { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        productName: { type: String, required: true },
        price:       { type: Number, required: true },
        quantity:    { type: Number, required: true, min: 1 },
        subtotal:    { type: Number, required: true },
      },
    ],

    deliveryMethod: {
      type: String,
      enum: Object.values(DELIVERY_METHOD),
      required: true,
    },

    subtotal:       { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    deliveryFee:    { type: Number, required: true },
    ppnAmount:      { type: Number, required: true },
    finalTotal:     { type: Number, required: true },

    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PACKING,
    },

    statusHistory: [
      {
        status:    { type: String, enum: Object.values(ORDER_STATUS), required: true },
        notes:     { type: String, default: "" },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    expiredAt:  { type: Date, default: null },
    returnedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

orderSchema.methods.pushStatus = function (status, notes = "") {
  this.status = status;
  this.statusHistory.push({ status, notes });
};

const Order = mongoose.model("Order", orderSchema);

export default Order;
