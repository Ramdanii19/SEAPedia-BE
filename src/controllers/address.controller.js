import * as addressService from "../services/address.service.js";
import { sendSuccess } from "../utils/response.js";

export async function createAddress(req, res, next) {
  try {
    const { recipientName, phone, addressDetail, isDefault } = req.body;
    const address = await addressService.createAddress({
      buyerId: req.user._id,
      recipientName,
      phone,
      addressDetail,
      isDefault,
    });

    return sendSuccess(res, { address }, "Address created", 201);
  } catch (err) {
    next(err);
  }
}
