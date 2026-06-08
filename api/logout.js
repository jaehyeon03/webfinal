import { initializeDatabase } from "../server/database.js";
import { clearSession } from "../serverless/auth.js";
import {
  applyApiHeaders,
  handleApiError,
  methodNotAllowed,
  requireApiRequestHeader,
  sendJson,
  sendNoContent,
} from "../serverless/http.js";

export default async function handler(request, response) {
  applyApiHeaders(response);
  if (request.method === "OPTIONS") return sendNoContent(response);
  if (request.method !== "POST") return methodNotAllowed(response);
  if (!requireApiRequestHeader(request, response)) return;

  try {
    await initializeDatabase();
    await clearSession(request, response);
    return sendJson(response, 200, { message: "로그아웃되었습니다." });
  } catch (error) {
    return handleApiError(response, error);
  }
}
