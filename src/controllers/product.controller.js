import * as productService from "../services/product.service.js";
import { sendSuccess } from "../utils/response.js";

export async function createProduct(req, res, next) {
  try {
    const { name, description, price, stock, imageUrl } = req.body;
    const product = await productService.createProduct({
      sellerId: req.user._id,
      name,
      description,
      price,
      stock,
      imageUrl,
    });

    return sendSuccess(res, { product }, "Product created", 201);
  } catch (err) {
    next(err);
  }
}
