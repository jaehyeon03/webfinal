import crypto from "node:crypto";
import { getCollections, initializeDatabase } from "../server/database.js";
import { hashPassword, normalizeUser, setSession } from "../serverless/auth.js";
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
    const name = compactText(body.name, 40);
    const email = compactText(body.email, 254).toLowerCase();
    const password = typeof body.password === "string" ? body.password : "";

    if (!name || !email || !password) {
      return sendJson(response, 400, { message: "이름, 이메일, 비밀번호를 모두 입력해 주세요." });
    }
    if (!EMAIL_PATTERN.test(email)) {
      return sendJson(response, 400, { message: "올바른 이메일 형식으로 입력해 주세요." });
    }
    if (password.length < 8 || password.length > 128) {
      return sendJson(response, 400, { message: "비밀번호는 8자 이상 128자 이하로 입력해 주세요." });
    }

    const { users } = getCollections();
    if (await users.findOne({ email })) {
      return sendJson(response, 409, { message: "이미 가입된 이메일입니다." });
    }

    const { salt, hash } = hashPassword(password);
    const user = {
      id: crypto.randomUUID(),
      name,
      email,
      password_salt: salt,
      password_hash: hash,
      created_at: new Date(),
    };

    await users.insertOne(user);
    await setSession(request, response, user.id);
    return sendJson(response, 201, { user: normalizeUser(user) });
  } catch (error) {
    return handleApiError(response, error);
  }
}
