import { getCollections, getDatabase, getMongoConfig, initializeDatabase } from "../server/database.js";
import { applyApiHeaders, handleApiError, methodNotAllowed, sendJson, sendNoContent } from "../serverless/http.js";

export default async function handler(request, response) {
  applyApiHeaders(response);
  if (request.method === "OPTIONS") return sendNoContent(response);
  if (request.method !== "GET") return methodNotAllowed(response);

  try {
    await initializeDatabase();
    await getDatabase().command({ ping: 1 });
    const { dbName } = getMongoConfig();
    const { users, sessions, resumes, reviews, jobs } = getCollections();
    const [userCount, sessionCount, resumeCount, reviewCount, jobCount] = await Promise.all([
      users.countDocuments(),
      sessions.countDocuments(),
      resumes.countDocuments(),
      reviews.countDocuments(),
      jobs.countDocuments(),
    ]);

    return sendJson(response, 200, {
      ok: true,
      database: "mongodb",
      dbName,
      counts: {
        users: userCount,
        sessions: sessionCount,
        resumes: resumeCount,
        reviews: reviewCount,
        jobs: jobCount,
      },
    });
  } catch (error) {
    return handleApiError(response, error);
  }
}
