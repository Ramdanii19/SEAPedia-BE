import * as addressService from "../services/address.service.js";
import { sendSuccess } from "../utils/response.js";

export async function listAddresses(req, res, next) {
  try {
    const addresses = await addressService.listAddresses(req.user._id);
    return sendSuccess(res, { addresses });
  } catch (err) {
    next(err);
  }
}

export async function updateAddress(req, res, next) {
  try {
    const { label, recipientName, phone, addressDetail, isDefault } = req.body;
    const updates = Object.fromEntries(
      Object.entries({ label, recipientName, phone, addressDetail, isDefault }).filter(([, v]) => v !== undefined)
    );

    const address = await addressService.updateAddress({
      addressId: req.params.id,
      buyerId: req.user._id,
      updates,
    });

    return sendSuccess(res, { address }, "Address updated");
  } catch (err) {
    next(err);
  }
}

export async function deleteAddress(req, res, next) {
  try {
    await addressService.deleteAddress({ addressId: req.params.id, buyerId: req.user._id });
    return sendSuccess(res, null, "Address deleted");
  } catch (err) {
    next(err);
  }
}

export async function createAddress(req, res, next) {
  try {
    const { label, recipientName, phone, addressDetail, isDefault } = req.body;
    const address = await addressService.createAddress({
      buyerId: req.user._id,
      label,
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
