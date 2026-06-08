import { getCollections, initializeDatabase } from "../server/database.js";
import { normalizeUser, setSession, verifyPassword } from "../serverless/auth.js";
import {
  applyApiHeaders,
  compactText,
  EMAIL_PATTERN,
  getClientIp,
  handleApiError,
  isRateLimited,
  methodNotAllowed,
  readJson,
  requireApiRequestHeader,
  requireJsonContent,
  sendJson,
  sendNoContent,
} from "../serverless/http.js";

const AUTH_RATE_LIMIT = { limit: 8, windowMs: 15 * 60 * 1000 };

export default async function handler(request, response) {
  applyApiHeaders(response);
  if (request.method === "OPTIONS") return sendNoContent(response);
  if (request.method !== "POST") return methodNotAllowed(response);
  if (!requireApiRequestHeader(request, response)) return;
  if (!requireJsonContent(request, response)) return;

  try {
    await initializeDatabase();

    if (isRateLimited(`auth:${getClientIp(request)}`, AUTH_RATE_LIMIT)) {
      return sendJson(response, 429, { message: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." });
    }

    const body = await readJson(request);
    const email = compactText(body.email, 254).toLowerCase();
    const password = typeof body.password === "string" ? body.password : "";
    const { users } = getCollections();
    const user = await users.findOne({ email });

    if (!EMAIL_PATTERN.test(email) || password.length > 128 || !user || !verifyPassword(password, user.password_salt, user.password_hash)) {
      return sendJson(response, 401, { message: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    await setSession(request, response, user.id);
    return sendJson(response, 200, { user: normalizeUser(user) });
  } catch (error) {
    return handleApiError(response, error);
  }
}
