import { sendSuccess } from "../utils/response.js";
import { ApiError } from "../utils/ApiError.js";

export async function uploadImage(req, res, next) {
  try {
    if (!req.file) {
      throw new ApiError(400, "No file uploaded");
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const url = `${baseUrl}/uploads/${req.file.filename}`;
    return sendSuccess(res, { url }, "File uploaded", 201);
  } catch (err) {
    next(err);
  }
}
