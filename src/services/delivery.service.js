import DeliveryJob from "../models/deliveryJob.model.js";
import { ApiError } from "../utils/ApiError.js";
import { DELIVERY_JOB_STATUS } from "../constants/enums.js";

export async function getJobDetail(jobId) {
  const job = await DeliveryJob.findById(jobId).populate({
    path: "order",
    select: "shippingRecipientName shippingPhone shippingAddress deliveryMethod deliveryFee items status store",
    populate: [
      { path: "store", select: "storeName addressDetail" },
      { path: "items.product", select: "name imageUrl" },
    ],
  });

  if (!job) throw new ApiError(404, "Delivery job not found");
  return job;
}

export async function listAvailableJobs({ page = 1, limit = 10 }) {
  const skip = (page - 1) * limit;

  const [jobs, total] = await Promise.all([
    DeliveryJob.find({ status: DELIVERY_JOB_STATUS.AVAILABLE })
      .populate({
        path: "order",
        select: "shippingRecipientName shippingAddress deliveryMethod deliveryFee store",
        populate: { path: "store", select: "storeName addressDetail" },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    DeliveryJob.countDocuments({ status: DELIVERY_JOB_STATUS.AVAILABLE }),
  ]);

  return {
    jobs,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}
