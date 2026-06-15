import * as storeService from "../services/store.service.js";
import { sendSuccess } from "../utils/response.js";

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
