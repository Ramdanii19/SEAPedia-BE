import * as productService from "../services/product.service.js";
import { sendSuccess } from "../utils/response.js";

export async function listPublicProducts(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const result = await productService.listPublicProducts({ page, limit });
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getProductDetail(req, res, next) {
  try {
    const product = await productService.getProductDetail(req.params.id);
    return sendSuccess(res, { product });
  } catch (err) {
    next(err);
  }
}

export async function listMyProducts(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const result = await productService.listMyProducts({ sellerId: req.user._id, page, limit });
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

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
