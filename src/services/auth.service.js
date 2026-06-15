import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { signToken } from "../utils/jwt.js";

export async function register({ fullName, email, password, roles }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, "Email already registered");
  }

  const activeRole = roles.length === 1 ? roles[0] : undefined;

  const user = await User.create({
    fullName,
    email,
    password,
    roles,
    ...(activeRole && { activeRole }),
  });

  const token = signToken({ id: user._id });

  return { user, token };
}
