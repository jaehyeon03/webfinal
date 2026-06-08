import { getCollections, initializeDatabase } from "../server/database.js";
import { applyApiHeaders, handleApiError, methodNotAllowed, sendJson, sendNoContent } from "../serverless/http.js";
import { normalizeJob } from "../serverless/normalizers.js";

export default async function handler(request, response) {
  applyApiHeaders(response);
  if (request.method === "OPTIONS") return sendNoContent(response);
  if (request.method !== "GET") return methodNotAllowed(response);

  try {
    await initializeDatabase();
    const { jobs } = getCollections();
    const items = await jobs.find({}).sort({ id: 1 }).toArray();
    return sendJson(response, 200, { jobs: items.map(normalizeJob) });
  } catch (error) {
    return handleApiError(response, error);
  }
}
