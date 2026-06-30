import * as authService from "../services/auth.service.js";
import { sendSuccess } from "../utils/response.js";
import { blacklistToken } from "../utils/tokenBlacklist.js";
import { env } from "../config/env.js";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { user, token, roles, needRoleSelection } = await authService.login({ email, password });

    return sendSuccess(res, { user, token, roles, needRoleSelection }, "Login successful");
  } catch (err) {
    next(err);
  }
}

export function logout(req, res) {
  const { jti, exp } = req.tokenPayload;
  blacklistToken(jti, exp * 1000); // exp is Unix seconds → ms
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

export async function forgotPassword(req, res, next) {
  try {
    await authService.forgotPassword({ email: req.body.email });
    return sendSuccess(res, null, "Jika email terdaftar, kode reset telah dikirim");
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { email, code, newPassword } = req.body;
    await authService.resetPassword({ email, code, newPassword });
    return sendSuccess(res, null, "Password berhasil direset");
  } catch (err) {
    next(err);
  }
}

export function googleAuth(req, res) {
  const params = new URLSearchParams({
    client_id: env.googleClientId,
    redirect_uri: env.googleCallbackUrl,
    response_type: "code",
    scope: "email profile",
    access_type: "offline",
    prompt: "select_account",
  });
  res.redirect(`${GOOGLE_AUTH_URL}?${params}`);
}

export async function googleCallback(req, res) {
  const { code } = req.query;
  if (!code) return res.redirect(`${env.frontendUrl}/login?error=oauth_failed`);

  try {
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: env.googleClientId,
        client_secret: env.googleClientSecret,
        redirect_uri: env.googleCallbackUrl,
        grant_type: "authorization_code",
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error("No access token");

    const userRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await userRes.json();

    const { token, needRoleSelection } = await authService.loginWithGoogle({
      googleId: profile.id,
      email: profile.email,
      fullName: profile.name,
    });

    return res.redirect(
      `${env.frontendUrl}/auth/callback?token=${token}&needRoleSelection=${needRoleSelection}`
    );
  } catch {
    return res.redirect(`${env.frontendUrl}/login?error=oauth_failed`);
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
