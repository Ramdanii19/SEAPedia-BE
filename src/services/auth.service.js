import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { signToken } from "../utils/jwt.js";
import { ROLES } from "../constants/enums.js";

export async function login({ email, password }) {
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  const nonAdminRoles = user.roles.filter((r) => r !== ROLES.ADMIN);
  const needRoleSelection = nonAdminRoles.length > 1 && !user.activeRole;

  const token = signToken({ id: user._id });

  return { user, token, roles: user.roles, needRoleSelection };
}

export async function selectActiveRole({ userId, role }) {
  const user = await User.findById(userId);
  if (!user.roles.includes(role)) {
    throw new ApiError(403, `Role '${role}' is not assigned to this account`);
  }

  user.activeRole = role;
  await user.save();

  const token = signToken({ id: user._id });

  return { user, token };
}

export async function loginWithGoogle({ googleId, email, fullName }) {
  let user = await User.findOne({ $or: [{ googleId }, { email }] });

  if (user) {
    if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }
  } else {
    user = await User.create({
      fullName,
      email,
      googleId,
      roles: [ROLES.BUYER],
      activeRole: ROLES.BUYER,
    });
  }

  const nonAdminRoles = user.roles.filter((r) => r !== ROLES.ADMIN);
  const needRoleSelection = nonAdminRoles.length > 1 && !user.activeRole;
  const token = signToken({ id: user._id });

  return { user, token, needRoleSelection };
}

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
