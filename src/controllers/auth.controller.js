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

export async function register(req, res, next) {
  try {
    const { fullName, email, password, roles } = req.body;
    const { user, token } = await authService.register({ fullName, email, password, roles });

    return sendSuccess(res, { user, token }, "Registration successful", 201);
  } catch (err) {
    next(err);
  }
}
