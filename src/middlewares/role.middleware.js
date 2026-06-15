import { ApiError } from "../utils/ApiError.js";
import { ROLES } from "../constants/enums.js";

export function requireRole(...allowed) {
  return (req, res, next) => {
    const user = req.user;

    // Admin bypass: cek array roles, bukan activeRole
    if (allowed.includes(ROLES.ADMIN) && user.roles.includes(ROLES.ADMIN)) {
      return next();
    }

    if (!allowed.includes(user.activeRole)) {
      return next(new ApiError(403, "Access forbidden: insufficient role"));
    }

    next();
  };
}
