import DeliveryJob from "../models/deliveryJob.model.js";
import Order from "../models/order.model.js";
import Wallet from "../models/wallet.model.js";
import WalletTransaction from "../models/walletTransaction.model.js";
import { ApiError } from "../utils/ApiError.js";
import { DELIVERY_JOB_STATUS, ORDER_STATUS, WALLET_TX_TYPE } from "../constants/enums.js";
import { getOrCreateWallet } from "./wallet.service.js";

// Rumus earning driver: earning = deliveryFee × DRIVER_EARNING_RATE (default 0.8)
// Dihitung saat processOrder dan disimpan di DeliveryJob.earning.
// Driver tidak mendapat potongan PPN — earning adalah bagian bersih dari ongkir.
export async function getDriverDashboard(driverId) {
  const [activeJob, allJobs, wallet] = await Promise.all([
    DeliveryJob.findOne({ driver: driverId, status: DELIVERY_JOB_STATUS.TAKEN })
      .populate({ path: "order", select: "shippingAddress shippingRecipientName deliveryMethod store", populate: { path: "store", select: "storeName" } }),
    DeliveryJob.find({ driver: driverId })
      .select("status earning takenAt completedAt order")
      .populate({ path: "order", select: "shippingAddress deliveryMethod createdAt" })
      .sort({ createdAt: -1 }),
    getOrCreateWallet(driverId),
  ]);

  const completedJobs = allJobs.filter((j) => j.status === DELIVERY_JOB_STATUS.COMPLETED);
  const totalEarning = completedJobs.reduce((sum, j) => sum + j.earning, 0);

  return {
    activeJob: activeJob ?? null,
    totalEarning,
    completedCount: completedJobs.length,
    walletBalance: wallet.balance,
    jobHistory: allJobs,
  };
}

export async function completeJob({ jobId, driverId }) {
  const job = await DeliveryJob.findById(jobId);
  if (!job) throw new ApiError(404, "Delivery job not found");
  if (!job.driver.equals(driverId)) throw new ApiError(403, "This job is not assigned to you");
  if (job.status !== DELIVERY_JOB_STATUS.TAKEN) {
    throw new ApiError(400, `Job cannot be completed from status '${job.status}'`);
  }

  job.status = DELIVERY_JOB_STATUS.COMPLETED;
  job.completedAt = new Date();
  await job.save();

  const order = await Order.findById(job.order);
  order.pushStatus(ORDER_STATUS.COMPLETED, "Delivered by driver");
  await order.save();

  const wallet = await getOrCreateWallet(driverId);
  await Wallet.findByIdAndUpdate(wallet._id, { $inc: { balance: job.earning } });
  await WalletTransaction.create({
    wallet: wallet._id,
    type: WALLET_TX_TYPE.EARNING,
    amount: job.earning,
    description: `Penghasilan pengiriman order #${order._id}`,
  });

  return job;
}

export async function takeJob({ jobId, driverId }) {
  // Atomic: filter status AVAILABLE memastikan hanya 1 driver berhasil update
  const job = await DeliveryJob.findOneAndUpdate(
    { _id: jobId, status: DELIVERY_JOB_STATUS.AVAILABLE },
    {
      $set: {
        driver: driverId,
        status: DELIVERY_JOB_STATUS.TAKEN,
        takenAt: new Date(),
      },
    },
    { new: true }
  );

  if (!job) throw new ApiError(409, "Job tidak tersedia atau sudah diambil driver lain");

  const order = await Order.findById(job.order);
  order.pushStatus(ORDER_STATUS.DELIVERING, "Picked up by driver");
  await order.save();

  return job;
}

export async function getJobDetail({ jobId, driverId }) {
  const job = await DeliveryJob.findById(jobId).populate({
    path: "order",
    select: "shippingRecipientName shippingPhone shippingAddress deliveryMethod deliveryFee items status store",
    populate: [
      { path: "store", select: "storeName addressDetail" },
      { path: "items.product", select: "name imageUrl" },
    ],
  });

  if (!job) throw new ApiError(404, "Delivery job not found");

  // AVAILABLE jobs are visible to all drivers (needed to decide whether to take).
  // TAKEN/COMPLETED jobs contain private recipient data — restrict to assigned driver only.
  if (job.status !== DELIVERY_JOB_STATUS.AVAILABLE && !job.driver?.equals(driverId)) {
    throw new ApiError(403, "Access denied");
  }

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
