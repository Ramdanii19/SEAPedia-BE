import * as reviewService from "../services/review.service.js";
import { sendSuccess } from "../utils/response.js";

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
