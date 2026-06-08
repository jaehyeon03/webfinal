import { initializeDatabase } from "../server/database.js";
import { getCurrentUser, normalizeUser } from "../serverless/auth.js";
import { applyApiHeaders, handleApiError, methodNotAllowed, sendJson, sendNoContent } from "../serverless/http.js";

export default async function handler(request, response) {
  applyApiHeaders(response);
  if (request.method === "OPTIONS") return sendNoContent(response);
  if (request.method !== "GET") return methodNotAllowed(response);

  try {
    await initializeDatabase();
    return sendJson(response, 200, { user: normalizeUser(await getCurrentUser(request)) });
  } catch (error) {
    return handleApiError(response, error);
  }
}
