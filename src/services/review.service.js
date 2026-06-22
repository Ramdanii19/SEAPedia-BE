import Review from "../models/review.model.js";
import { ApiError } from "../utils/ApiError.js";
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

export async function updateReview({ reviewId, userId, reviewerName, rating, comment }) {
  const review = await Review.findById(reviewId);
  if (!review) throw new ApiError(404, "Review not found");

  if (!review.user || review.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not allowed to edit this review");
  }

  if (reviewerName !== undefined) review.reviewerName = reviewerName;
  if (rating !== undefined) review.rating = rating;
  if (comment !== undefined) review.comment = sanitizeText(comment);

  await review.save();
  return review;
}

export async function deleteReview({ reviewId, userId }) {
  const review = await Review.findById(reviewId);
  if (!review) throw new ApiError(404, "Review not found");

  if (!review.user || review.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not allowed to delete this review");
  }

  await review.deleteOne();
}
