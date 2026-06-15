import { verifyToken } from "../utils/jwt.js";
import { ApiError } from "../utils/ApiError.js";
import { isBlacklisted } from "../utils/tokenBlacklist.js";
import User from "../models/user.model.js";

export function requireActiveRole(req, res, next) {
  if (!req.user?.activeRole) {
    return next(new ApiError(403, "Please select an active role before continuing"));
  }
  next();
}

export async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new ApiError(401, "No token provided");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (isBlacklisted(decoded.jti)) {
      throw new ApiError(401, "Token has been invalidated");
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError(401, "User no longer exists");
    }

    req.user = user;
    req.tokenPayload = decoded;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return next(new ApiError(401, "Invalid or expired token"));
    }
    next(err);
  }
}
