import * as reviewService from "../services/review.service.js";
import { sendSuccess } from "../utils/response.js";
import { ApiError } from "../utils/ApiError.js";

export async function listReviews(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const result = await reviewService.listReviews({ page, limit });

    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function createReview(req, res, next) {
  try {
    const { reviewerName, rating, comment } = req.body;
    const review = await reviewService.createReview({
      user: req.user ?? null,
      reviewerName,
      rating,
      comment,
    });

    return sendSuccess(res, { review }, "Review submitted", 201);
  } catch (err) {
    next(err);
  }
}

export async function updateReview(req, res, next) {
  try {
    if (!req.user) return next(new ApiError(401, "Authentication required"));
    const { reviewerName, rating, comment } = req.body;
    const review = await reviewService.updateReview({
      reviewId: req.params.id,
      userId: req.user._id,
      reviewerName,
      rating,
      comment,
    });
    return sendSuccess(res, { review });
  } catch (err) {
    next(err);
  }
}

export async function deleteReview(req, res, next) {
  try {
    if (!req.user) return next(new ApiError(401, "Authentication required"));
    await reviewService.deleteReview({
      reviewId: req.params.id,
      userId: req.user._id,
    });
    return sendSuccess(res, null, "Review deleted");
  } catch (err) {
    next(err);
  }
}
