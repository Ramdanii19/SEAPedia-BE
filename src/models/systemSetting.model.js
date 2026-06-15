import mongoose from "mongoose";

const systemSettingSchema = new mongoose.Schema(
  {
    // Singleton: selalu hanya ada 1 dokumen, diidentifikasi dengan _id tetap
    _id: { type: String, default: "singleton" },
    currentDatetime: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: false, updatedAt: "updatedAt" },
    _id: false,
  }
);

const SystemSetting = mongoose.model("SystemSetting", systemSettingSchema);

export default SystemSetting;
