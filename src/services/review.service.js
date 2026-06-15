import sanitizeHtml from "sanitize-html";
import Review from "../models/review.model.js";

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
  const sanitizedComment = sanitizeHtml(comment, { allowedTags: [], allowedAttributes: {} });

  const review = await Review.create({
    user: user?._id ?? null,
    reviewerName,
    rating,
    comment: sanitizedComment,
  });

  return review;
}
