import * as authService from "../services/auth.service.js";
import { sendSuccess } from "../utils/response.js";

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { user, token, roles, needRoleSelection } = await authService.login({ email, password });

    return sendSuccess(res, { user, token, roles, needRoleSelection }, "Login successful");
  } catch (err) {
    next(err);
  }
}

// JWT is stateless — server cannot invalidate a token.
// Strategy: client drops the token on logout. Full blacklist (Redis TTL) deferred to Level 7 hardening.
export function logout(req, res) {
  return sendSuccess(res, null, "Logged out successfully");
}

export function getMe(req, res) {
  const { user } = req;
  return sendSuccess(res, {
    user,
    roles: user.roles,
    activeRole: user.activeRole,
    financialSummary: {
      walletBalance: 0,
      sellerRevenue: 0,
      driverEarning: 0,
    },
  });
}

export async function selectActiveRole(req, res, next) {
  try {
    const { role } = req.body;
    const { user, token } = await authService.selectActiveRole({ userId: req.user._id, role });

    return sendSuccess(res, { user, token }, "Active role updated");
  } catch (err) {
    next(err);
  }
}

export async function register(req, res, next) {
  try {
    const { fullName, email, password, roles } = req.body;
    const { user, token } = await authService.register({ fullName, email, password, roles });

    return sendSuccess(res, { user, token }, "Registration successful", 201);
  } catch (err) {
    next(err);
  }
}
