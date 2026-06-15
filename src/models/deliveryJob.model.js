import mongoose from "mongoose";
import { DELIVERY_JOB_STATUS } from "../constants/enums.js";

const deliveryJobSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    earning: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(DELIVERY_JOB_STATUS),
      default: DELIVERY_JOB_STATUS.AVAILABLE,
    },
    takenAt:     { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const DeliveryJob = mongoose.model("DeliveryJob", deliveryJobSchema);

export default DeliveryJob;
