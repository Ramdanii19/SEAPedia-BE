import * as storeService from "../services/store.service.js";
import { sendSuccess } from "../utils/response.js";

export async function getStoreById(req, res, next) {
  try {
    const store = await storeService.getStoreById(req.params.id);
    return sendSuccess(res, { store });
  } catch (err) {
    next(err);
  }
}

export async function getMyStore(req, res, next) {
  try {
    const store = await storeService.getMyStore(req.user._id);
    return sendSuccess(res, { store });
  } catch (err) {
    next(err);
  }
}

export async function updateStore(req, res, next) {
  try {
    const { storeName, description, addressDetail } = req.body;
    const updates = Object.fromEntries(
      Object.entries({ storeName, description, addressDetail }).filter(([, v]) => v !== undefined)
    );

    const store = await storeService.updateStore({
      storeId: req.params.id,
      sellerId: req.user._id,
      updates,
    });

    return sendSuccess(res, { store }, "Store updated");
  } catch (err) {
    next(err);
  }
}

export async function createStore(req, res, next) {
  try {
    const { storeName, description, addressDetail } = req.body;
    const store = await storeService.createStore({
      sellerId: req.user._id,
      storeName,
      description,
      addressDetail,
    });

    return sendSuccess(res, { store }, "Store created", 201);
  } catch (err) {
    next(err);
  }
}
