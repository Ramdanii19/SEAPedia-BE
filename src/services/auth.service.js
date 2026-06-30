import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { signToken } from "../utils/jwt.js";
import { ROLES } from "../constants/enums.js";
import { sendPasswordResetEmail } from "../utils/mailer.js";

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

export async function forgotPassword({ email }) {
  const user = await User.findOne({ email });
  // Selalu return sukses agar tidak bocor info apakah email terdaftar
  if (!user) return;

  const code = String(Math.floor(100000 + Math.random() * 900000));
  user.passwordResetCode = code;
  user.passwordResetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 menit
  await user.save();

  await sendPasswordResetEmail(email, code);
}

export async function resetPassword({ email, code, newPassword }) {
  const user = await User.findOne({ email }).select("+passwordResetCode +passwordResetExpiry");
  if (!user || !user.passwordResetCode) {
    throw new ApiError(400, "Kode tidak valid");
  }
  if (user.passwordResetCode !== code) {
    throw new ApiError(400, "Kode tidak valid");
  }
  if (user.passwordResetExpiry < new Date()) {
    throw new ApiError(400, "Kode sudah kadaluarsa");
  }

  user.password = newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpiry = undefined;
  await user.save();
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
