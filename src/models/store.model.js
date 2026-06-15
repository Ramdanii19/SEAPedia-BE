import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    storeName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    addressDetail: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Store = mongoose.model("Store", storeSchema);

export default Store;
