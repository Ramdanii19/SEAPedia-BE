import Review from "../models/review.model.js";
import { sanitizeText } from "../utils/sanitize.js";

export async function listReviews({ page = 1, limit = 10 }) {
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    Review.countDocuments(),
  ]);

  return {
    reviews,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function createReview({ user, reviewerName, rating, comment }) {
  const sanitizedComment = sanitizeText(comment);

  const review = await Review.create({
    user: user?._id ?? null,
    reviewerName,
    rating,
    comment: sanitizedComment,
  });

  return review;
}
