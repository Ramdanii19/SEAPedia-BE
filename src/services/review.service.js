import sanitizeHtml from "sanitize-html";
import Review from "../models/review.model.js";

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
